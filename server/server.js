// Schedule node app server source code. This file was
// written by msfninja <msfninja@airmail.cc>.
//
// (c) 2021 Schedule

'use strict';

const // modules
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
	{ MongoClient } = require('mongodb');

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
			path.join(path.resolve(__dirname,'..'),'config.yml')
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
	dburl = 'mongodb://127.0.0.1:27017',
	dbclient = new MongoClient(dburl);

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
		return s.toLowerCase().replace(/[^a-z0-9\-]/g,'').replace(/[\t \n]/g,'-'); 
	};

const // app functions
	term = (r,s,h,c) => {
		r.writeHead(s,h);
		if (c) r.write(c);
		r.end();
	},
	render = (res,req,h,m) => {
		let
			html = rd(h),
			modes = m.split(''),
			accept = ['a','r','u','x'],
			components = [
				[
					'doctype',
					'footer',
					'header',
					'link',
					'loader',
					'meta',
					'noscript',
					'script'
				],
				[
					'usr.nav',
					'usr.pwa',
					'usr.script'
				]
			];

		if (compare(modes,accept).match) {
			if (modes.includes(accept[accept.indexOf('r')])) {
				for (var i = components[0].length - 1; i >= 0; i--) {
					html = html.replace(
						new RegExp(`\{component\.${components[0][i]}\}`,'g'),
						rd(
							path.join(dir,`server/client/component/${components[0][i]}.xhtml`)
						)
					);
				}

				for (const prop in config.app) {
					if (typeof config[prop] !== 'object') {
						html = html.replace(
							new RegExp(`\{app\.${prop}\}`,'g'),
							config.app[prop]
						);
					}
				}
			}
			if (modes.includes(accept[accept.indexOf('u')])) {
				let
					user = new User(res,req),
					cookie = cookies(req),
					dat = user.request('tkn',cookie['UTOKEN']);

				for (var i = components[1].length - 1; i <= 0; i--) {
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
		var
			obj = {},
			rc = r.headers.cookie;
		rc && rc.split(';').forEach(e => {
			var parts = e.split('=');
			obj[parts.shift().trim()] = decodeURIComponent(parts.join('='));
		});
		return obj;
	},
	createNav = c => {
		let
			html = '',
			navdat = YAML.parse(rd(`${dir}/app/nav.yml`)).nav;

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
		console.log(`${config.cli.name.blue.bold}> ${s}`);
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
			term(res,200,{'Content-Type':'application/xhtml+xml'},render(res,req,`${dir}/root/panel/index.xhtml`,'arx'));
		}
		else {
			term(res,200,{'Content-Type':'application/xhtml+xml'},render(res,req,`${dir}/root/index.xhtml`,'ar'));
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
			hash = bcrypt.hash(o.psw,config.server.security.salt_rounds,(e,h) => {
				if (e) throw e;
				return h;
			}),
			key = crypto.pbkdf2(hash,guuid(),config.server.security.pbkdf2_iter,32,'sha512',(e,k) => {
				if (e) throw e;
				return k;
			}),
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
			utokens.create(obj.usr,true);
		});
	};

	this.verify = a => { // verify user credentials or token
		if (a) {
			if (typeof a === 'object' && !Array.isArray(a)) {
				let
					usr = async () => {
						await db.collection('users').find({},(e,r) => {
							if (e) throw e;
							r.toArray((f,s) => {
								if (f) throw f;
								return s;
							});
						}).find(e => e === a.usr);
					};

				if (usr) {
					let
						obj = {
							usr: usr,
							psw: a.psw
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
			else if (typeof a === 'string') {
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
				render(
					res,req,
					path.join(dir,'app/index.xhtml'),
					'ru'
				)
			);
		}
		else {
			term(
				res,200,
				{ 'Content-Type': 'application/xhtml+xml' },
				render(
					res,req,
					path.join(dir,'public/index/index.xhtml'),
					'r'
				)
			);
		}
	};

	this.check = u => { // check if user exists
		let
			usr = async () => {
				await db.collection('users').find({},(e,r) => {
					if (e) throw e;
					return r.usr;
				});
			};

		return usr ? true : false;
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
							res,req,
							path.join(dir,'server/client/err/500.xhtml'),
							'r'
						)
					);
				}
			}
		);

		obj = JSON.parse(
			rd(
				`${dirs.dat}/usr/${u}/data.json`
			)
		);
		obj.tkn = token;

		fs.writeFile(`${dirs.dat}/usr/${u}/data.json`,JSON.stringify(obj),err => {
			if (err) term(res,500,{'Content-Type':'application/xhtml+xml'},render(res,req,`${dir}/server/client/err/500.xhtml`,'r'));
		});

		let exp = new Date(time + expires).toUTCString();

		if (c) term(res,302,[
			['Set-Cookie',`UTOKEN=${token}; Path=/; Expires=${exp};`],
			['Set-Cookie',`HASH=${obj.key}; Path=/; Expires=${exp};`],
			['Set-Cookie',`KEY=${obj.ckey}; Path=/; Expires=${exp};`],
			['Location','/usr']
		]);
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
					utokens.splice(utokens.indexOf(target),1);
					fs.writeFile(`${dirs.dat}/auth/usr/tokens.json`,JSON.stringify(utokens),err => {
						if (err) throw err;
					});
				}
				if (d) {
					delete dat.tkn;
					fs.writeFile(`${dirs.dat}/usr/${dat.usr}/data.json`,JSON.stringify(dat),err => {
						if (err) throw err;
					});
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

const // https server
	start = port => {
		https.createServer(opt,(req,res) => {
			let
				q = url.parse(req.url,true),
				p = q.pathname,
				ip = req.connection.remoteAddress.replace(/^\:+[a-z]{4}\:/i),
				cookie = cookies(req),
				root = new Root(res,req),
				rtokens = new RTokens(res),
				user = new User(res,req),
				utokens = new UTokens(res),
				todos = new Todos(res),
				notes = new Notes(res),
				calendar = new Calendar(res),
				school = new School();

			if (p === '/') {
				if (user.verify(cookie['UTOKEN'])) {
					term(res,302,{'Location':'/usr'});
				}
				else {
					term(res,200,{'Content-Type':'application/xhtml+xml'},render(res,req,`${dir}/public/index/index.xhtml`,'r'));
				}
			}
			else if (p.split('/')[1] === 'sign-up') {
				term(res,200,{'Content-Type':'application/xhtml+xml'},render(res,req,`${dir}/public/index/sign-up/index.xhtml`,'r'));
			}
			else if (p.split('/')[1] === 'privacy') {
				term(res,200,{'Content-Type':'application/xhtml+xml'},render(res,req,`${dir}/public/index/privacy/index.xhtml`,'r'));
			}
			else if (p.split('/')[1] === 'cookies') {
				term(res,200,{'Content-Type':'application/xhtml+xml'},render(res,req,`${dir}/public/index/cookies/index.xhtml`,'r'));
			}
			else if (p.split('/').includes('usr')) {
				if (p.split('/')[1] === 'usr') {
					if (req.method === 'POST') {
						let body;

						req.on('data',chunk => body = chunk.toString());
						req.on('end',() => {
							let post = qs.parse(body);

							if (post.type === 'sign-in') {
								if (post.usr && post.psw) {
									if (
										user.verify({
											usr: post.usr.toString(),
											psw: post.psw.toString()
										})
									) {
										if (!cookie['UTOKEN']) {
											if (user.request('usr',post.usr).utoken) {
												term(
													res,302,
													{
														'Set-Cookie': `UTOKEN=${user.request('usr',post.usr).utoken}; Path=/;`,
														'Location': '/usr'
													}
												);
											}
											else {
												utokens.create(post.usr,true);
											}
										}
										else {
											term(res,302,{'Location':'/usr'});
										}
									}
								}
								term(res,302,{'Location':'/'});
							}
							else if (post.type === 'sign-up') {
								if (post.usr && post.psw && post.rpsw) {
									if (!user.check(post.usr) && post.psw === post.rpsw) user.create(post);
									else term(res,302,{'Location':'/sign-up'});
								}
							}
							else {
								user.login(false);
							}
						});
					}
					else if (req.method === 'GET') {
						if (p.split('/')[2] === 'sign-out') {
							term(res,302,{'Set-Cookie':'UTOKEN=; Path=/;','Location':'/'});
						}
						else if (cookie['UTOKEN']) {
							if (user.verify(cookie['UTOKEN'])) {
								user.login(true);
							}
							else {
								term(res,302,{'Location':'/'});
							}
						}
						else term(res,302,{'Location':'/'});
					}
					else term(res,405,{'Content-Type':'application/xhtml+xml'},render(res,req,`${dir}/server/client/err/405.xhtml`,'r'));
				}
			}
			else if (p.split('/').includes('root')) {
				res.end();
			}
			else {
				const h = path.resolve(dir,p.replace(/^\/*/,'public/'));
				if (ex(h)) {
					fs.readFile(h,(err,dat) => {
						if (err) term(res,500,{'Content-Type':'application/xhtml+xml'},render(res,req,`${dir}/server/client/err/500.xhtml`,'r'));
						res.statusCode = 200;
						return res.end(dat);
					});
				}
				else term(res,404,{'Content-Type':'application/xhtml+xml'},render(res,req,`${dir}/server/client/err/404.xhtml`,'r'));
			}
		}).listen(port);
	};

const // crypt variables
	algorithm = 'aes-256-ctr',
	iv = crypto.randomBytes(16);

const // crypt functions
	encrypt = (t,k) => {
		const
			cipher = crypto.createCipheriv(algorithm,k,iv),
			encrypted = Buffer.concat([cipher.update(t),cipher.final()]);
		return {
			iv: iv.toString('hex'),
			content: encrypted.toString('hex')
		};
	},
	decrypt = (h,k) => {
		const
			decipher = crypto.createDecipheriv(algorithm,k,Buffer.from(h.iv,'hex')),
			decrypted = Buffer.concat([decipher.update(Buffer.from(h.content,'hex')),decipher.final()]);
		return decrypted.toString();
	};

const // security
	getuuid = n => {
		let str = '';
		for (var i = 0; i < n; i++) str += uuidv4().toString().replace(/\-/g,'');
		return str;
	},
	token = getuuid(Math.ceil(config.server.security.token_length / 32)),
	recover = getuuid(Math.ceil(config.server.security.recover_token_length / 32));

const // auth
	keys = t => {
		let h = `${dirs.dat}/auth/root/keys.hash`;

		if (ex(h)) {
			try {
				return JSON.parse(rd(`${dirs.dat}/auth/root/keys.hash`))[t];
			}
			catch (e) {
				cli.err(`There was an error retrieving root account credentials:\n\n${e}`);
				process.exit(1);
			}
		}
	},
	guid = () => {
		let str = rd(`${dirs.dat}/auth/guid.asc`);

		if (str.split('').length !== 32) {
			let nguuid = getuuid(1);
			fs.writeFile(`${dirs.dat}/auth/guid.asc`,nguuid,err => {
				if (err) throw err;
			});
			return nguuid;
		}
		return str;
	};

if (rd(`${dirs.usr}/${config.app.alt_name}-data/server/init`)) {
	try {
		(async () => {
			await dbclient.connect();
		})();
		db = dbclient.db(config.app.alt_name);
		start(config.server.port);
		cli.cls();
		cli.log(`Server running at https://${ip.address()}:${config.server.port}\n\n`);
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