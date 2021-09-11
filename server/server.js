// (c) 2021 Schedule
// Server source code

'use strict';

const // modules
	https = require('https'),
	http = require('http'),
	path = require('path'),
	url = require('url'),
	fs = require('fs'),
	qs = require('querystring'),
	ip = require('ip'),
	YAML = require('yaml'),
	crypto = require('crypto'),
	{
		v1: uuidv1,
		v4: uuidv4
	} = require('uuid');

const // ssl
	options = {
		key: fs.readFileSync('key.pem'),
		cert: fs.readFileSync('cert.pem')
	};

const // basic variables
	dir = path.resolve(__dirname,'..');

let config; // config

const // basic operations
	ex = h => { return fs.existsSync(h); },
	rd = h => { return ex(h) ? fs.readFileSync(h).toString() : ''; },
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
		return s.toLowerCase().replace(/[^a-z0-9\-]/g,'').replace(/ /g,'-');
	};

try { config = YAML.parse(rd(`${dir}/config.yml`)); }
catch (e) { throw e; }

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
			accept = ['a','r','u','x'];

		if (compare(modes,accept).match) {
			if (modes.includes(accept[accept.indexOf('r')])) {
				html = html.replace(/\{component\.doctype\}/g,rd(`${dir}/server/client/component/doctype.xhtml`)).replace(/\{component\.meta\}/g,rd(`${dir}/server/client/component/meta.xhtml`)).replace(/\{component\.link\}/g,rd(`${dir}/server/client/component/link.xhtml`)).replace(/\{component\.script\}/g,rd(`${dir}/server/client/component/script.xhtml`)).replace(/\{component\.noscript\}/g,rd(`${dir}/server/client/component/noscript.xhtml`)).replace(/\{component\.loader\}/g,rd(`${dir}/server/client/component/loader.xhtml`)).replace(/\{component\.header\}/g,rd(`${dir}/server/client/component/header.xhtml`)).replace(/\{component\.footer\}/g,rd(`${dir}/server/client/component/footer.xhtml`));
				html = html.replace(/\{app\.name\}/g,config.app.name).replace(/\{app\.lname\}/g,config.app.lname).replace(/\{app\.title\}/g,config.app.title).replace(/\{app\.desc\}/g,config.app.desc).replace(/\{app\.version\}/g,config.app.version).replace(/\{app\.release.tag\}/g,config.app.release.tag);
			}
			if (modes.includes(accept[accept.indexOf('u')])) {
				let
					user = new User(res,req),
					cookie = cookies(req),
					dat = user.request('tkn',cookie['UTOKEN']);
				html = html.replace(/\{component\.usr\.pwa\}/g,rd(`${dir}/server/client/component/usr.pwa.xhtml`)).replace(/\{component\.usr\.script\}/g,rd(`${dir}/server/client/component/usr.script.xhtml`)).replace(/\{component\.usr\.nav\}/g,rd(`${dir}/server/client/component/usr.nav.xhtml`)).replace(/\{nav.tabs.true\}/g,createNav(true)).replace(/\{nav.tabs.false\}/g,createNav(false));
				html = html.replace(/\{user\.name\}/g,dat.usr);
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
		let html = '';
		config.app.nav.forEach(e => {
			if (c) {
				if (e.nav) {
					html += `
						<div title="Go to ${e.name}" id="btn-nav-${format(e.name)}" class="nav-btn" onclick="window.location.href = '${e.href}';">
							<div class="ico">
								<span><i class="bi bi-${e.icon}"></i></span>
							</div>
							<div class="txt">
								<span>${e.name}</span>
							</div>
						</div>
					`;
				}
			}
			else {
				if (!e.nav) {
					html += `
						<div title="Go to ${e.name}" id="btn-${format(e.name)}" class="btn" onclick="window.location.href = '${e.href}';">
							<div class="ico">
								<span><i class="bi bi-${e.icon}"></i></span>
							</div>
							<div class="txt">
								<span>${e.name}</span>
							</div>
						</div>
					`;
				}
			}
		});
		return html;
	};

function Root(res,req) { // root function
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
			term(res,200,{'Content-Type':'application/xhtml+xml'},render(res,req,`${dir}/server/root/panel/index.xhtml`,'arx'));
		}
		else {
			term(res,200,{'Content-Type':'application/xhtml+xml'},render(res,req,`${dir}/server/root/index.xhtml`,'ar'));
		}
	};
	this.cred = (t,a) => { // credentials recovery
		if (t === 'set') {
			let obj = {};
			obj.usr = a[0];
			obj.psw = encrypt(a[1],`${a[1]}${guid()}`.substr(0,32));
			fs.writeFile(`${dir}/server/root/dat/keys.hash`,JSON.stringify(obj),err => {
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
			h = `${dir}/server/dat/usr/${o.usr}`,
			obj = {
				usr: o.usr,
				psw: encrypt(o.psw,`${o.psw}${guid()}`.substr(0,32))
			},
			arr = [
				h,
				`${h}/content/calendar`,
				`${h}/content/notes`,
				`${h}/content/school`,
				`${h}/content/to-dos`
			];
		arr.forEach(e => {
			fs.mkdir(e,{ recursive: true },err => {
				if (err) throw err;
			});
		});
		fs.writeFile(`${h}/data.json`,JSON.stringify(obj),err => {
			if (err) term(res,500,{'Content-Type':'application/xhtml+xml'},render(res,req,`${dir}/server/client/err/500.xhtml`,'r'));
			utokens.create(o.usr,true);
		});
	};
	this.verify = a => { // verify user credentials or token
		if (a) {
			if (Object.prototype.toString.call(a) === '[object Array]') {
				let usr = fs.readdirSync(`${dir}/server/dat/usr`).find(e => e === a[0]);
				if (usr) {
					let dat = JSON.parse(rd(`${dir}/server/dat/usr/${usr}/data.json`));
					if (dat.usr === a[0] && decrypt(dat.psw,`${a[1]}${guid()}`.substr(0,32)) === a[1]) {
						return true;
					}
				}
			}
			else if (typeof a === 'string') {
				let tkn = fs.readdirSync(`${dir}/server/dat/usr`).find(e => utokens.verify(JSON.parse(rd(`${dir}/server/dat/usr/${e}/data.json`)).utoken));
				return tkn ? true : false;
			}
		}
		return false;
	};
	this.login = c => { // login for user
		if (c) {
			term(res,200,{'Content-Type':'application/xhtml+xml'},render(res,req,`${dir}/server/app/index.xhtml`,'ru'));
		}
		else {
			term(res,200,{'Content-Type':'application/xhtml+xml'},render(res,req,`${dir}/public/index.xhtml`,'r'));
		}
	};
	this.check = u => { // check if user exists
		let usr = fs.readdirSync(`${dir}/server/dat/usr`).find(e => e === u);
		return usr ? true : false;
	};
	this.request = (t,r) => { // request user data by username or token
		let usr = fs.readdirSync(`${dir}/server/dat/usr`);
		if (usr) {
			if (t === 'usr') {
				let target = usr.find(e => e === r);

				if (target) return JSON.parse(rd(`${dir}/server/dat/usr/${r}/data.json`));
			}
			else if (t === 'tkn') {
				if (utokens.get()) {
					let target = utokens.get().find(e => e.tkn === r);

					if (target) return JSON.parse(rd(`${dir}/server/dat/usr/${target.usr}/data.json`));
				}
			}
		}
		return false;
	};
}

function UTokens(res) { // user tokens function
	let utokens;

	try {
		utokens = JSON.parse(rd(`${dir}/server/auth/usr/tokens.json`));
	}
	catch (e) { utokens = false; }

	this.get = () => { // get array of user tokens
		return utokens;
	};
	this.create = (u,c) => { // create user token
		let
			time = new Date().valueOf(),
			expires = 100 * 60 * 60 * 24 * 30 *12,
			token = getuuid(1),
			arr = [],
			obj = {
				usr: u,
				tkn: token,
				exp: time + expires
			};
		if (utokens) arr = utokens;
		arr.push(obj);
		fs.writeFile(`${dir}/server/auth/usr/tokens.json`,JSON.stringify(arr),err => {
			if (err) term(res,500,{'Content-Type':'application/xhtml+xml'},render(res,req,`${dir}/server/client/err/500.xhtml`,'r'));
		});
		obj = JSON.parse(rd(`${dir}/server/dat/usr/${u}/data.json`));
		obj.utoken = token;
		fs.writeFile(`${dir}/server/dat/usr/${u}/data.json`,JSON.stringify(obj),err => {
			if (err) term(res,500,{'Content-Type':'application/xhtml+xml'},render(res,req,`${dir}/server/client/err/500.xhtml`,'r'));
		});
		if (c) term(res,302,{'Set-Cookie':`UTOKEN=${token}; Path=/;`,'Location':'/usr'});
	};
	this.verify = t => { // verify user token
		if (utokens) {
			let tkn = utokens.find(e => e.tkn === t);
			if (tkn) return true;
		}
		return false;
	};
	this.delete = (t,c,d) => { // delete user token from array and user data
		if (utokens) {
			let
				user = new User(res),
				dat = user.request('tkn',t),
				target = utokens.find(e => e.tkn === t);

			if (target) {
				if (c) {
					utokens.splice(utokens.indexOf(target),1);
					fs.writeFile(`${dir}/server/auth/usr/tokens.json`,JSON.stringify(utokens),err => {
						if (err) throw err;
					});
				}
				if (d) {
					delete dat.utoken;
					fs.writeFile(`${dir}/server/dat/usr/${dat.usr}/data.json`,JSON.stringify(dat),err => {
						if (err) throw err;
					});
				}
			}

			dat = '';
			target = '';
		}
	};
}

const // https server
	start = port => {
		https.createServer(options,(req,res) => {
			let
				q = url.parse(req.url,true),
				p = q.pathname,
				ip = req.connection.remoteAddress.replace(/^\:+[a-z]{4}\:/i),
				cookie = cookies(req),
				root = new Root(res,req),
				rtokens = new RTokens(res),
				user = new User(res,req),
				utokens = new UTokens(res);

			if (p === '/') {
				if (user.verify(cookie['UTOKEN'])) {
					term(res,302,{'Location':'/usr'});
				}
				else {
					term(res,200,{'Content-Type':'application/xhtml+xml'},render(res,req,`${dir}/public/index.xhtml`,'r'));
				}
			}
			else if (p.split('/')[1] === 'sign-up') {
				term(res,200,{'Content-Type':'application/xhtml+xml'},render(res,req,`${dir}/public/sign-up/index.xhtml`,'r'));
			}
			else if (p.split('/')[1] === 'privacy') {
				term(res,200,{'Content-Type':'application/xhtml+xml'},render(res,req,`${dir}/public/privacy/index.xhtml`,'r'));
			}
			else if (p.split('/')[1] === 'cookies') {
				term(res,200,{'Content-Type':'application/xhtml+xml'},render(res,req,`${dir}/public/cookies/index.xhtml`,'r'));
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
									if (user.verify([post.usr,post.psw])) {
										if (!cookie['UTOKEN']) {
											if (user.request('usr',post.usr).utoken) {
												term(res,302,{'Set-Cookie':`UTOKEN=${user.request('usr',post.usr).utoken}; Path=/;`,'Location':'/usr'});
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
							else user.login(false);
						});
					}
					else if (req.method === 'GET') {
						if (p.split('/')[2] === 'sign-out') {
							term(res,302,{'Set-Cookie':'UTOKEN=; Path=/;','Location':'/'});
						}
						else if (cookie['UTOKEN']) {
							if (user.verify(cookie['UTOKEN'])) user.login(true);
							else term(res,302,{'Location':'/'});
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
			decrpyted = Buffer.concat([decipher.update(Buffer.from(h.content,'hex')),decipher.final()]);
		return decrpyted.toString();
	};

const // security
	getuuid = n => {
		let str = '';
		for (var i = 0; i < n; i++) str += uuidv4().toString().replace(/\-/g,'');
		return str;
	},
	token = getuuid(config.server.security.token_length),
	recover = getuuid(config.server.security.recover_token_length);

const // auth
	keys = t => { return JSON.parse(rd(`${dir}/server/root/dat/keys.hash`))[t]; },
	guid = () => {
		let str = rd(`${dir}/server/auth/guid.asc`);
		if (str.split('').length !== 32) {
			let nguuid = getuuid(1);
			fs.writeFile(`${dir}/server/auth/guid.asc`,nguuid,err => {
				if (err) throw err;
			});
			return nguuid;
		}
		return str;
	};

console.clear();

try {
	start(config.server.port);
	console.log(`Server running at https://${ip.address()}:${config.server.port}\n\n`);
}
catch (e) { throw e; }