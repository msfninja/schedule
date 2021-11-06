// Schedule node app server source code. This file was
// written by msfninja <msfninja@airmail.cc>.
//
// (c) 2021 Schedule

'use strict';

const // modules
	http = require('http'),
	https = require('https'),
	path = require('path'),
	url = require('url'),
	fs = require('fs'),
	qs = require('querystring'),
	ip = require('ip'),
	crypto = require('crypto'),
	bcrypt = require('bcrypt'),
	{
		v1: uuidv1,
		v4: uuidv4
	} = require('uuid'),
	YAML = require('yaml'),
	colors = require('colors'),
	os = require('os'),
	{ MongoClient } = require('mongodb'),
	nodemailer = require('nodemailer'),
	SMTPServer = require('smtp-server').SMTPServer,
	parser = require('mailparser').simpleParser;

const // cli object constructor (global scope)
	cli = new CLI();

const // repo
	repo = {
		gh: {
			url: 'https://github.com/msfninja/schedule',
			blob: 'https://github.com/msfninja/schedule/blob/main'
		}
	};

let // config and db
	config,
	db;

try {
	config = YAML.parse(
		fs.readFileSync(
			path.join(
				path.resolve(__dirname,'..'),
				'config.yml'
			)
		).toString());

	if (!config) throw new Error('The config.yml file seems to be incorrectly configured.');
}
catch (e) {
	cli.err(
		e,
		`Download the proper config.yml file from the repository:\n\n${repo.gh.blob}/config.yml`
	);
	process.exit(1);
}

const // dirs
	dir = path.resolve(__dirname,'..'),
	dirs = {
		usr: os.homedir(),
		dat: path.join(os.homedir(),`${config.app.alt_name}-data`)
	};

const // mongodb
	dbclient = new MongoClient('mongodb://127.0.0.1:27017');

const // ssl
	opt = {
		key: fs.readFileSync(
			path.join(dir,'server/ssl/key.pem')
		),
		cert: fs.readFileSync(
			path.join(dir,'server/ssl/cert.pem')
		)
	};

const // basic operations
	ex = h => {
		return fs.existsSync(h);
	},
	rd = h => {
		return ex(h) ? fs.readFileSync(h).toString() : '';
	},
	compare = (a,b) => {
		let arr = [];
		for (var i = 0; i < a.length; i++) for (var j = 0; j < b.length; j++) if (a[i] === b[j]) arr.push(a[i]);
		return {
			array: arr,
			match: arr.length > 0,
			size: arr.length
		};
	},
	format = s => {
		return s
			.toLowerCase()
			.replace(
				/[^a-z0-9\-]/g,
				''
			)
			.replace(
				/\s/g,
				'-'
			);
	};

const // app functions
	term = (r,s,h,c) => {
		r.writeHead(s,h);
		if (c) r.write(c);
		r.end();
	},
	render = (req,res,h,m) => {
		let
			html = rd(h),
			modes = m.split(''),
			accept = [
				'a','r','u','x'
			],
			components = [
				[],[]
			];

		fs.readdirSync(
			path.join(dir,'server/client/component')
		).forEach(e => {
			let h = path.join(dir,'server/client/component',e);

			if (fs.lstatSync(h).isFile()) {
				let
					c = e
						.split(/\./)
						.slice(0,1)
						.join('.');

				if (e.split(/\./)[0] !== 'usr') {
					components[0].push(c);
				}
				else {
					components[1].push(c);
				}
			}
		});

		if (compare(modes,accept).match) {
			if (modes.includes('r')) {
				for (var i = components[0].length - 1; i >= 0; i--) {
					html = html.replace(
						new RegExp(`\{component\.${components[0][i]}\}`,'g'),
						rd(
							path.join(dir,`server/client/component/${components[0][i]}.xhtml`)
						)
					);
				}

				for (const p in config.app) {
					if (typeof config[p] !== 'object') {
						html = html.replace(
							new RegExp(`\{app\.${p}\}`,'g'),
							config.app[p]
						);
					}
				}
			}
			if (modes.includes('u')) {
				let
					user = new User(res,req),
					cookie = cookies(req),
					dat = user.request('tkn',cookie['UTOKEN']);

				for (var i = components[1].length - 1; i >= 0; i--) {
					html = html.replace(
						new RegExp(`\{component\.${components[1][i]}\}`,'g'),
						rd(
							path.join(dir,`server/client/component/${components[1][i]}.xhtml`)
						)
					);
				}

				html = html
					.replace(/\{nav.tabs.true\}/g,createNav(true))
					.replace(/\{nav.tabs.false\}/g,createNav(false))
					.replace(/\{user\.name\}/g,dat.usr);
			}
		}

		return html;
	};

const // site functions
	cookies = r => {
		let
			obj = {},
			rc = r.headers.cookie;

		rc && rc.split(';').forEach(e => {
			let parts = e.split('=');
			obj[parts.shift().trim()] = decodeURIComponent(parts.join('='));
		});
		return obj;
	},
	createNav = c => {
		let
			html = '',
			navdat = YAML.parse(
				rd(`${dir}/app/nav.yml`)
			).nav;

		navdat.forEach(e => {
			if (c) {
				if (e.nav) {
					html += `<div title="Go to ${e.name}" id="btn-nav-${format(e.name)}" class="nav-btn" onclick="window.location.href = '${e.href}';">
							<div class="ico">
								<span><i class="bi bi-${e.icon}"></i></span>
							</div>
							<div class="txt">
								<span>${e.name}</span>
							</div>
						</div>`;
				}
			}
			else {
				if (!e.nav) {
					html += `<div title="Go to ${e.name}" id="btn-${format(e.name)}" class="btn" onclick="window.location.href = '${e.href}';">
							<div class="ico">
								<span><i class="bi bi-${e.icon}"></i></span>
							</div>
							<div class="txt">
								<span>${e.name}</span>
							</div>
						</div>`;
				}
			}
		});
		return html;
	};

function CLI() {
	this.log = s => {
		console.log(s);
	};

	this.err = (e,s) => {
		console.clear();
		console.error(`${'\nERROR:'.red.bold}\n\n${e}\n`);
		if (s) console.log(`${'SOLUTION:'.blue.bold}\n\n${s}\n`);
	};

	this.cls = () => {
		console.clear();
	};
}

function Root(res,req) { // root function // NOT READY FOR USE
	let rtokens = new RTokens(res);

	this.verify = a => { // verify root credentials or token
		if (a) {
			if (Object.prototype.toString.call(a) === '[object Array]') {
				return a[0] === keys('usr') && a[1] === decrypt(keys('psw'),`${a[1]}${guid()}`.substr(0,32));
			}
			else if (typeof a === 'string') {
				return rtokens.verify(a);
			}
		}
		return false;
	};

	this.login = c => { // login for root
		if (c) {
			term(res,200,{'Content-Type':'application/xhtml+xml'},render(req,res,`${dir}/root/panel/index.xhtml`,'arx'));
		}
		else {
			term(res,200,{'Content-Type':'application/xhtml+xml'},render(req,res,`${dir}/root/index.xhtml`,'ar'));
		}
	};

	this.cred = (t,a) => { // credentials recovery // NOT READY FOR USE
		if (t === 'set') {
			let obj = {};
			
			obj.usr = a[0];
			obj.psw = encrypt(
				a[1],
				`${a[1]}${guid()}`.substr(0,32)
			);

			fs.writeFile(`${dirs.dat}/auth/root/dat/keys.hash`,JSON.stringify(obj),err => {
				if (err) throw err;
			});
		}
	};
}

function RTokens(res) { // root tokens function
	this.create = () => {};

	this.verify = t => {
		return false;
	};

	this.delete = t => {};
}

function User(res,req) { // user function
	let utokens = new UTokens(res);

	this.create = o => { // create user account
		let
			hash,
			key;

		bcrypt.hash(o.psw,config.server.sec.salt_rounds,(e,h) => {
			if (e) throw e;
			
			hash = h;

			crypto.pbkdf2(h,guid(),config.server.sec.pbkdf2_iter,32,'sha512',(e,k) => {
				if (e) throw e;

				key = k;

				let
					ckey = getuuid(2).substring(0,32),
					obj = {
						usr: o.usr,
						hash: hash,
						key: encrypt(key,ckey),
						ckey: ckey
					},
					h = path.join(dirs.dat,'usr',obj.usr),
					arr = [ path.join(h,'cnt') ];

				o = null;

				try {
					fs.accessSync(
						path.join(dirs.dat,'usr'),
						fs.constants.R_OK | fs.constants.W_OK
					);
				}
				catch (e) {
					try {
						fs.chmodSync(
							path.join(dirs.dat,'usr'),
							0o724
						);
					}
					catch (f) {
						cli.err(
							`${config.app.name} cannot save any user data to this directory:\n\n${h}\n\n${f}`,
							`Check the permissions of the user you run this node app as on that directory.`
						);
						process.exit(1);
					}
				}

				arr.forEach(e => {
					fs.mkdirSync(
						e,
						{ recursive: true }
					);
				});

				fs.writeFile(
					path.join(dirs.dat,'usr',obj.usr,'data.json'),
					JSON.stringify({
						tkn: null
					}),
					e => {
						if (e) throw e;
					}
				);

				db.collection('users').insertOne(obj,e => {
					if (e) throw e;

					cli.log(`ACCOUNT CREATED: ${JSON.stringify(obj,null,2)}\n\ncreating token...`);

					utokens.create(obj.usr,true);
				});
			});
		});
	};

	this.verify = (...a) => { // verify user credentials or token
		if (a) {
			if (a.length === 2) {
				let
					usr = async () => {
						await db.collection('users').find({},(e,r) => {
							if (e) throw e;
							r.toArray((f,s) => {
								if (f) throw f;
								return s;
							});
						}).find(e => e === a[0]);
					};

				if (usr) {
					let
						obj = {
							usr: a[0],
							psw: a[1]
						},
						dat = JSON.parse(
							rd(
								path.join(dirs.dat,'usr',obj.usr,'data.json')
							)
						),
						match = bcrypt.compare(obj.psw,dat.hash,(e,r) => {
							return e ? false : r;
						});

					return dat.usr === obj.usr && match;
				}
			}
			else if (a.length === 1) {
				let
					tkn = fs.readdirSync(
						path.join(dirs.dat,'usr')
					).find(e =>
						utokens.verify(
							JSON.parse(
								rd(
									path.join(dirs.dat,'usr',e,'data.json')
								)
							).utoken
						)
					);

				return tkn ? true : false;
			}
		}
		return false;
	};

	this.login = c => { // login for user
		if (c) {
			term(
				res,200,
				{ 'Content-Type': 'application/xhtml+xml' },
				render(req,res,
					path.join(dir,'app/index.xhtml'),
					'ru'
				)
			);
		}
		else {
			term(
				res,200,
				{ 'Content-Type': 'application/xhtml+xml' },
				render(req,res,
					path.join(dir,'public/index/index.xhtml'),
					'r'
				)
			);
		}
	};

	this.check = u => { // check if user exists
		(async () => {
			await db.collection('users').findOne(
				{ usr: u },
				(e,r) => {
					if (e) throw e;
					return r;
				}
			);
		})();
	};

	this.request = (t,d) => { // request user data by username or token
		let
			usr = async () => {
				await db.collection('users').find({},(e,r) => {
					if (e) throw e;
					r.toArray((f,s) => {
						if (e) throw e;
						return s;
					});
				});
			};

		if (usr) {
			if (t === 'usr') {
				let target = usr.find(e => e === d);

				if (target) return target;
			}
			else if (t === 'tkn') {
				if (utokens.get()) {
					let target = utokens.get().find(e => e.tkn === d);

					if (target) {
						return JSON.parse(
							rd(
								path.join(dirs.dat,'usr',target.usr,'data.json')
							)
						);
					}
				}
			}
		}

		return false;
	};
}

function UTokens(res) { // user tokens function
	let utokens;

	try {
		utokens = JSON.parse(
			rd(
				path.join(dirs.dat,'auth/usr/tokens.json')
			)
		);
	}
	catch (e) {
		utokens = false;
	}

	this.get = () => { // get array of user tokens
		return utokens;
	};

	this.create = (u,c) => { // create user token
		let
			time = new Date().valueOf(),
			expires = config.server.usr.session.time,
			token = getuuid(1),
			arr = [],
			obj = {
				usr: u,
				tkn: token,
				exp: time + expires
			};

		if (utokens) arr = utokens;

		arr.push(obj);

		fs.writeFile(
			path.join(dirs.dat,'auth/usr/tokens.json'),
			JSON.stringify(arr),
			err => {
				if (err) {
					term(
						res,500,
						{ 'Content-Type': 'application/xhtml+xml' },
						render(
							req,res,
							path.join(dir,'public/err/500.xhtml'),
							'r'
						)
					);
				}
			}
		);

		obj = JSON.parse(
			rd(
				path.join(dirs.dat,'usr',u,'data.json')
			)
		);

		obj.tkn = token;

		fs.writeFile(
			path.join(dirs.dat,'usr',u,'data.json'),
			JSON.stringify(obj),
			err => {
				if (err) {
					term(
						res,500,
						{ 'Content-Type': 'application/xhtml+xml' },
						render(
							req,res,
							path.join(dir,'public/err/500.xhtml'),
							'r'
						)
					);
				}
			}
		);

		cli.log('created token:\n\n' + JSON.stringify(obj,null,2));

		let exp = new Date(time + expires).toUTCString();

		if (c) {
			term(
				res,301,
				[
					[ 'Set-Cookie',`UTOKEN=${token}; Path=/; Expires=${exp};` ],
					[ 'Set-Cookie',`HASH=${obj.key}; Path=/; Expires=${exp};` ],
					[ 'Set-Cookie',`CKEY=${obj.ckey}; Path=/; Expires=${exp};` ],
					[ 'Location','/usr' ]
				]
			);
		}
	};

	this.verify = t => { // verify user token
		if (utokens) {
			let tkn = utokens.find(e => e.tkn === t);

			if (tkn) return true;
		}
		return false;
	};

	this.delete = (t,c,d) => { // delete user token from tokens.json and/or user data
		if (utokens) {
			let
				user = new User(res),
				dat = user.request('tkn',t),
				target = utokens.find(e => e.tkn === t);

			if (target) {
				if (c || target.exp > new Date().valueOf()) {
					utokens.splice(
						utokens.indexOf(target),
						1
					);

					fs.writeFile(
						path.join(dirs.dat,'auth/usr/tokens.json'),
						JSON.stringify(utokens),
						err => {
							if (err) throw err;
						}
					);
				}
				if (d) {
					delete dat.tkn;

					fs.writeFile(
						path.join(dirs.dat,'usr',dat.usr,'data.json'),
						JSON.stringify(dat),
						err => {
							if (err) throw err;
						}
					);
				}
			}

			dat = '';
			target = '';
		}
	};
}

function Todos(res) { // to-dos management
	let
		user = new User(res),
		cl = db.collection('todos');

	this.add = (t,o) => {
		if (user.verify(t)) {
			//
		}
	};

	this.get = t => {};

	this.delete = (t,i) => {};
}

function Notes(res) { // notes management // NOT READY FOR USE
	let user = new User(res);

	this.add = (t,o) => {
		if (user.verify(t)) {
			let
				dt = new Date(),
				u = user.request('tkn',t);

			fs.writeFile(`${dirs.dat}/usr/${u.usr}/cnt/notes/${dt.getFullYear()}${dt.getMonth()}${dt.getDate()}${dt.getHours()}${dt.getMinutes()}${dt.getSeconds()}.json`,JSON.stringify(o),err => {
				if (err) throw err;
			});
		}
	};

	this.get = t => {
		if (user.verify(t)) {
			let
				arr = [],
				u = user.request('tkn',t);

			fs.readdirSync(`${dirs.dat}/usr/${u.usr}/cnt/notes`).forEach(e => {
				let todo = JSON.parse(rd(`${dirs.dat}/usr/${u.usr}/cnt/notes/${e}`));
				todo.id = e;
				arr.push(todo);
			});

			return arr;
		}
	};

	this.delete = (t,i) => {
		if (user.verify(t)) {
			let
				u = user.request('tkn',t),
				target = fs.readdirSync(`${dirs.dat}/usr/${u.usr}/cnt/notes`).find(e => e === i);

			if (target) {
				fs.unlink(`${dirs.dat}/usr/${u.usr}/cnt/notes/${target}`,err => {
					if (err) throw err;
				})
			}
		}
	};
}

function Calendar(res) { // calendar management
	//
}

function School() { // schools/timetables management
	//
}

const // http/s servers
	main = () => {
		http.createServer((req,res) => {
			res
				.writeHead(
					301,
					{
						'Location': `https://${ip.address()}/${url.parse(req.url,true).path.replace(/^\/*/i,'')}`
					}
				)
				.end();
		}).listen(config.server.port);

		https.createServer(opt,(req,res) => {
			let
				q = url.parse(req.url,true),
				p = q.pathname,
				ip = req.connection.remoteAddress.replace(/^\:+[a-z]{4}\:/i),
				cookie = cookies(req);

			let
				root = new Root(res,req),
				rtokens = new RTokens(res),
				user = new User(res,req),
				utokens = new UTokens(res),
				todos = new Todos(res),
				notes = new Notes(res),
				calendar = new Calendar(res),
				school = new School();

			let indices = [];

			fs.readdirSync(
				path.join(dir,'public/index')
			).forEach(e => {
				if (
					fs.lstatSync(
						path.join(dir,'public/index',e)
					).isDirectory()
				) {
					indices.push(e);
				}
			});

			if (p === '/') {
				if (user.verify(cookie['UTOKEN'])) {
					term(
						res,301,
						{ 'Location': '/usr' }
					);
				}
				else {
					term(
						res,200,
						{ 'Content-Type': 'application/xhtml+xml' },
						render(
							req,res,
							path.join(dir,'public/index/index.xhtml'),
							'r'
						)
					);
				}
			}
			else if (indices.includes(p.split(/\//)[1])) {
				term(
					res,200,
					{ 'Content-Type': 'application/xhtml+xml' },
					render(
						req,res,
						path.join(dir,`public/index/${p.split(/\//)[1]}/index.xhtml`),
						'r'
					)
				);
			}
			else if (p.split(/\//).includes('usr')) {
				if (p.split(/\//)[1] === 'usr') {
					if (req.method === 'POST') {
						let body;

						req.on('data',chunk => body = chunk.toString());

						req.on('end',() => {
							let post = qs.parse(body);

							if (post.type === 'sign-in') {
								if (post.usr && post.psw) {
									if (
										user.verify(
											post.usr.toString(),
											post.psw.toString()
										)
									) {
										if (!cookie['UTOKEN']) {
											if (user.request('usr',post.usr).utoken) {
												term(
													res,301,
													{
														'Location': '/usr',
														'Set-Cookie': `UTOKEN=${user.request('usr',post.usr).utoken}; Path=/;`
													}
												);
											}
											else {
												utokens.create(post.usr,true);
											}
										}
										else {
											term(
												res,301,
												{ 'Location': '/usr' }
											);
										}
									}
								}

								term(
									res,301,
									{ 'Location': '/' }
								);
							}
							else if (post.type === 'sign-up') {
								if (post.usr && post.psw && post.rpsw) {
									if (user.check(post.usr)) {
										term(
											res,301,
											{ 'Location': '/sign-up?err=0' }
										);
									}
									else if (post.psw !== post.rpsw) {
										term(
											res,301,
											{ 'Location': '/sign-up?err=1' }
										);
									}
									else if (post.psw === post.rpsw) {
										user.create(post);
									}
									else {
										term(
											res,301,
											{ 'Location': '/sign-up?err=9' }
										);
									}
								}
							}
							else {
								user.login(false);
							}
						});
					}
					else if (req.method === 'GET') {
						if (p.split('/')[2] === 'sign-out') {
							utokens.delete(
								cookie['UTOKEN'],
								true,
								true
							);

							term(
								res,301,
								[
									[ 'Location','/' ],
									[ 'Set-Cookie',`UTOKEN=; Path=/; Expires=${new Date(0).toUTCString()};`],
									[ 'Set-Cookie',`HASH=; Path=/; Expires=${new Date(0).toUTCString()};`],
									[ 'Set-Cookie',`CKEY=; Path=/; Expires=${new Date(0).toUTCString()};`]
								]
							);
						}
						else if (cookie['UTOKEN']) {
							if (user.verify(cookie['UTOKEN'])) {
								user.login(true);
							}
							else {
								term(
									res,301,
									{ 'Location': '/' }
								);
							}
						}
						else {
							term(
								res,301,
								{ 'Location': '/' }
							);
						}
					}
					else term(
						res,405,
						{ 'Content-Type': 'application/xhtml+xml' },
						render(
							req,res,
							path.join(dir,'public/err/405.xhtml'),
							'r'
						)
					);
				}
			}
			else if (p.split(/\//).includes('root')) {
				res.end();
			}
			else {
				const h = path.resolve(
					dir,
					p.replace(
						/^\/*/,
						'public/'
					)
				);

				if (ex(h)) {
					fs.readFile(h,(err,dat) => {
						if (err) {
							term(
								res,500,
								{ 'Content-Type': 'application/xhtml+xml' },
								render(
									req,res,
									path.join(dir,'public/err/500.xhtml'),
									'r'
								)
							);
						}

						res.statusCode = 200;
						return res.end(dat);
					});
				}
				else {
					term(
						res,404,
						{ 'Content-Type': 'application/xhtml+xml' },
						render(
							req,res,
							path.join(dir,'public/err/404.xhtml'),
							'r'
						)
					);
				}
			}
		}).listen(config.server.port_tls);
	};

const // crypt variables
	algorithm = 'aes-256-ctr',
	iv = crypto.randomBytes(16);

const // crypt functions
	encrypt = (t,k) => {
		const
			cipher = crypto.createCipheriv(
				algorithm,k,iv
			),
			encrypted = Buffer.concat([
					cipher.update(t),
					cipher.final()
				]);

		return {
			iv: iv.toString('hex'),
			content: encrypted.toString('hex')
		};
	},
	decrypt = (h,k) => {
		const
			decipher = crypto.createDecipheriv(
				algorithm,
				k,
				Buffer.from(
					h.iv,'hex'
				)
			),
			decrypted = Buffer.concat([
				decipher.update(
					Buffer.from(
						h.content,'hex'
					)
				),
				decipher.final()
			]);

		return decrypted.toString();
	};

const // security
	getuuid = n => {
		let str = '';
		for (var i = 0; i < n; i++) str += uuidv4().toString().replace(/\-/g,'');
		return str;
	},
	token = getuuid(
		Math.ceil(config.server.sec.token_length / 32)
	),
	recover = getuuid(
		Math.ceil(config.server.sec.recover_token_length / 32)
	);

const // auth
	keys = t => {
		let h = path.join(dirs.dat,'auth/root/keys.hash');

		if (ex(h)) {
			try {
				return JSON.parse(rd(h))[t];
			}
			catch (e) {
				cli.err(`There was an error retrieving root account credentials:\n\n${e}`);
				process.exit(1);
			}
		}
	},
	guid = () => {
		let str = rd(
			path.join(dirs.dat,'auth/guid.asc')
		);

		if (str.split('').length !== 32) {
			let nguuid = getuuid(1);
			fs.writeFile(path.join(dirs.dat,'auth/guid.asc'),nguuid,err => {
				if (err) throw err;
			});
			return nguuid;
		}
		return str;
	};

if (
	rd(
		path.join(dirs.usr,`${config.app.alt_name}-data/server/.init`)
	)
) {
	try {
		(async () => {
			await dbclient.connect();
		})();
		db = dbclient.db(config.app.alt_name);
		main();
		cli.cls();
		cli.log(`Web client running at https://${ip.address()}:${config.server.port_tls}\n\n`);
	}
	catch (e) {
		cli.err(`The server could not be initiated:\n\n${e}`);
		process.exit(1);
	}
}
else {
	cli.err(
		'You cannot initiate the server without executing configure first!',
		`Set your current working directory to the root directory of this project, and run the following:\n\n${'./configure'.bold}\n\nAfter that, you can initiate the server.`
	);
	process.exit(1);
}