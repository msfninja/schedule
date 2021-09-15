**This file is in the process of being written!**

# Schedule | To-dos, Notes And More

Official website: [https://143.176.32.149:150](https://143.176.32.149:150)

**Please note that currently the project is under development. This means none of the code in this repository is guaranteed to be working.**

Schedule is a web application, allowing you to create and save to-dos, notes, calendar events and other miscellaneous information like your school timetable, on a server, and access it from any device<sup id="l-ref-1">[<a href="#ref-1">1</a>]</sup>.

It's a handy tool for any student, or generally anyone who needs to keep track of his tasks or a place to store information in forms of memos. Since Schedule is a web application, implying it is being accessed from a web browser<sup id="l-ref-2">[<a href="#ref-2">2</a>]</sup>, it can be used on virtually any device with a web browser and access to the internet/network on which the server is hosted. For accessibility (specifically on mobile devices), Schedule offers a Progressive Web Application (PWA), so that you can install it as an app, which provides access to it with ease right from your home screen.

Schedule is easy to use, has a nice and straightforward GUI and works seamlessly. Apart from that, Schedule is also a privacy-friendly utility. It stores all user data<sup id="l-ref-3">[<a href="#ref-3">3</a>]</sup> on the server encrypted, with the Advanced Encryption Standard using a 256 bit key size, this ensures nobody but you can access your data.

<table>
	<tr>
		<th>Table of Contents</th>
	</tr>
	<tr>
		<td>
			<ol>
				<li><a href="#notice">Notice</a></li>
				<li><a href="#prerequisites">Prerequisites</a></li>
				<ol>
					<li><a href="#nodejs-installation">Node.js Installation</a></li>
					<li><a href="#npm-modules">Npm Modules</a></li>
					<ol>
						<li><a href="#nodemon-installation">Nodemon Installation</a></li>
						<li><a href="#sass-installation">Sass Installation</a></li>
						<li><a href="#coffeescript-installation">CoffeeScript Installation</a></li>
						<li><a href="#other-modules">Other Modules</a></li>
					</ol>
					<li><a href="#git-installation">Git Installation</a></li>
				</ol>
				<li><a href="#repository-cloning">Repository Cloning</a></li>
				<li><a href="#server">Server</a></li>
				<ol>
					<li><a href="#ssl-certificate-and-pwa">SSL Certificate (And PWA)</a></li>
					<li><a href="#server-initiation">Server Initiation</a></li>
					<li><a href="#server-configuration">Server Configuration</a></li>
					<li><a href="#compiling-sass-code">Compiling Sass Code</a></li>
					<li><a href="#compiling-coffeescript-code">Compiling CoffeeScript Code</a></li>
				</ol>
				<li><a href="#support">Support</a></li>
				<li><a href="#references">References</a></li>
			</ol>
		</td>
	</tr>
</table>

## Notice

Schedule is an open source project licensed under the GNU General Public License version 3.0. To see what you may and may not do with the source code of this project, see the [license](https://github.com/msfninja/schedule/blob/main/LICENSE). The license can also be found in the root directory of the project as `LICENSE`.

Schedule is open source because 1) this way users can see how the thing works, 2) other developers can utilize the code and 3) I believe in open source, and it defines my fundamental understandings of how things should be, what is right and what is unjust.

As a sidenote, I do not manage or work on any projects that are explicitly proprietary or portray the ideology of proprietary software.

This README file will be assuming you using Linux, so when encountering commands or other system-related things, make sure you use your system's equivalent variant.

## Prerequisites

If you want to host Schedule on yourself on your server, you would need to have several items present to make it work. Not all items are mandatory, but some may be found useful.

### Node.js Installation

Frist of, you'd need [Node.js](https://nodejs.org/en/). Schedule basically boils down to being a node app, so to run the app, you need Node.js. You can download an installer or the source code from their official [website](https://nodejs.org/en/download/), or run these commands in your shell:

```bash
sudo apt-get update && sudo apt-get install -y nodejs
```

This should install Node.js on your system.

You can check what version of Node.js is installed on your system by issuing the following command in your shell:

```bash
nodejs --version
```

### Npm Modules

Apart from Node.js, this node app requires several modules to operate properly which do not come preinstalled with Node.js. The modules `ip`, `yaml`, `uuid`, `os` are required for Schedule to work, and other utilities like `nodemon`, Sass and CoffeeScript come in handy, but are optional.

#### Nodemon Installation

This one is optional, but really makes your life simpler. Instead of manually reinitiating your node app upon each a crash or modification to the node app's source code, you can automate this process by using [nodemon](https://nodemon.io/). To install nodemon, run the following command in your shell:

```bash
npm i -g nodemon
```

The `-g` flag will install nodemon globally, so you can use it system-wide in any project.

#### Sass Installation

#### CoffeeScript Installation

#### Other Modules

### Git Installation

## Repository Cloning

## Server

### SSL Certificate (And PWA)

### Server Initiation

### Server Configuration

### Compiling Sass Code

### Compiling CoffeeScript Code

## Support

If it happens that you need support setting up or configuring Schedule, or you have a question or idea, you can reach me out at the `#schedule` channel on the freenode IRC server, or mail me at <a href="mailto:msfninja@airmail.cc">msfninja@airmail.cc</a>.

You can always report issues and create pull requests on Schedule's [GitHub repository](https://github.com/msfninja/schedule).

---

## References

<sup id="ref-1">[<a href="#l-ref-1">1</a>]</sup> The scope of what devices you can use to access Schedule depends on how your network on which the server runs is configured.

<sup id="ref-2">[<a href="#l-ref-2">2</a>]</sup> Unless you install Schedule as a PWA on your device, in that case you will be accessing it from an self-imitating app, but technically still a browser.

<sup id="ref-3">[<a href="#l-ref-3">3</a>]</sup> User account data includes the following:

 - User password;
 - User to-dos;
 - User notes;
 - User calendar events;
 - User (school) timetable.