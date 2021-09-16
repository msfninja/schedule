**This file is in the process of being written!**

# Schedule | To-dos, Notes And More

Official website: [https://143.176.32.149:150](https://143.176.32.149:150).

**Please note that currently the project is under development. This means none of the code in this repository is guaranteed to be working.**

Schedule is a web application, allowing you to create and save to-dos, notes, calendar events and other miscellaneous information like your school timetable, on a server, and access it from any device<sup id="l-ref-1"><a href="#ref-1">1</a></sup>.

It's a handy tool for any student, or generally anyone who needs to keep track of his tasks or a place to store information in forms of memos. Since Schedule is a web application, implying it is being accessed from a web browser<sup id="l-ref-2"><a href="#ref-2">2</a></sup>, it can be used on virtually any device with a web browser and access to the internet/network on which the server is hosted. For accessibility (specifically on mobile devices), Schedule offers a progressive web application (PWA), so that you can install it as an (browser emulated) app, which provides access to it with ease right from your home screen.

Schedule is easy to use, has a nice and straightforward GUI and works seamlessly. Apart from that, Schedule is also a privacy-friendly utility. It stores all user data<sup id="l-ref-3"><a href="#ref-3">3</a></sup> on the server encrypted, with the Advanced Encryption Standard using a 256 bit key size, which ensures nobody but you can access your data.

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
				<li><a href="#initial-configuration">Initial Configuration</a></li>
				<li><a href="#server">Server</a></li>
				<ol>
					<li><a href="#ssl-certificate-and-pwa">SSL Certificate (And PWA)</a></li>
					<li><a href="#server-initiation">Server Initiation</a></li>
					<li><a href="#server-configuration">Server Configuration</a></li>
					<li><a href="#compiling-sass-code">Compiling Sass Code</a></li>
					<li><a href="#compiling-coffeescript-code">Compiling CoffeeScript Code</a></li>
				</ol>
				<li><a href="#support">Support</a></li>
				<li><a href="#notes">Notes</a></li>
			</ol>
		</td>
	</tr>
</table>

## Notice

Schedule is an open source project licensed under the [GNU General Public License version 3.0](https://www.gnu.org/licenses/gpl-3.0.html). To see what you may and may not do with the source code of this project, see the [license](https://github.com/msfninja/schedule/blob/main/LICENSE). The license can also be found in the root directory of the project as `LICENSE`.

Schedule is open source because 1) this way users can see how the thing works and what it does for themselves, 2) other developers can utilize the code and 3) I<sup id="l-ref-4"><a href="#ref-4">4</a></sup> believe in open source, and it defines my fundamental understandings of how things should be, what is right and what is unjust.

As a sidenote, I personally do not manage or work on any projects that are explicitly proprietary or portray the ideology of proprietary software.

This `README.md` file will be assuming you are using a Linux distribution, so when encountering commands or other system-related things and using an operating system other than Linux or a Linux distribution that is not featured, make sure you use your system's equivalent variant or way of achieving the result.

## Prerequisites

If you want to host Schedule yourself on your server, you'd need several items present for it to be possible. Not all items are mandatory, but some may be found useful.

### Node.js Installation

Frist of, you'll need [Node.js](https://nodejs.org/en/). Schedule basically boils down to a node app, so to run the app, you need Node.js. You can download an installer or the source code from their [official website](https://nodejs.org/en/download/), or run these commands in your shell:

**Ubuntu/Debian:**

```bash
sudo apt -y install nodejs
```

**Fedora:**

```bash
sudo dnf install nodejs
```

**RedHat/CentOS:**

```bash
sudo yum -y install nodejs
```

This should install Node.js on your system.

You can check what version of Node.js is installed (and if Node.js is actually installed) on your system by issuing the following in your shell:

```bash
node --version
```

If this returns an error, or doesn't output anything, it means that either Node.js is not installed, or installed incorrectly. Try reinstalling in this case.

### Npm Modules

Apart from Node.js, this node app requires several modules to operate properly which do not come preinstalled with Node.js by default. The modules `ip`, `yaml`, `uuid` and `colors` are required for Schedule to work, and other utilities like `nodemon` come in handy, but are optional. Further on there is also Sass and CoffeeScript, but you would only need those if you are planning on modifying any of the `.sass` or `.coffee` files (presuming you are going to compile the code as well to reflect the changes).

#### Nodemon Installation

This one is optional, but really makes your life easier and frees from a batch of headaches. Instead of manually reinitiating your node app upon each a crash of it or modification to its source code, you can automate this process by using [nodemon](https://nodemon.io/). To install nodemon, issue this command in your shell:

```bash
npm i -g nodemon
```

The `-g` option will install nodemon globally, so you can use it system-wide in any project<sup id="l-ref-5"><a href="#ref-5">5</a></sup>. Again, you can check the version of `nodemon` installed or its presence in the first place by running the following command:

```bash
nodemon --version
```

#### Sass Installation

Proceed with this step only if you are planning on modifying Schedule's `.sass` files and compling them, and you don't have it present on your machine yet.

To install Sass on your machine, run this command in your shell:

```bash
npm i -g sass
```

The `-g` option is the same story here as with `nodemon` mentioned [before](#nodemon-installation). You can check what version of Sass you have installed or if it is present by issuing the following command:

```bash
sass --version
```

#### CoffeeScript Installation

Proceed with this step only if you are planning on modifying Schedule's `.coffee` files and compling them, and you don't have it present on your machine yet.

To install CoffeeScript on your machine, issue the following:

```bash
npm i -g coffeescript
```

CoffeeScript's version or presence can be checked by running the following in your shell:

```bash
coffee --version
```

#### Other Modules

**Important: you should locally clone Schedule's repository before proceeding with this section, as you need a place to install the npm modules to. Follow [this section](#repository-cloning) first, and then proceed with installing the mandatory npm modules.**

As mentioned [earlier](#npm-modules), the `ip`, `yaml`, `uuid` and `colors` modules do not come preinstalled with Node.js by default. This means, for Schedule to work properly, you have to install them manually using npm.

You can issue the following command in your shell that will install them all (by default I have the `node_modules` directory inside the `server` directory, hence the `cd server` (assuming you are in the working directory to which you cloned Schedule's repository to (from [this section](#repository-cloning))) before the actual installation of the npm modules):

```bash
cd server; npm i ip yaml uuid colors
```

A brief description of what every module is used for:

 - `ip`: the `ip` module is used solely for one purpose&#8212;retrieve the server's IP address. It is not used for any IP logging or anything similar as it may seem. Schedule does not keep any personal/identifiable user data logs, and you can verify that in the source code.
 - `yaml`: the `yaml` module is used to parse YAML files. An example can be the `config.yml` file in the root directory of the project, which holds various configuration properties for Schedule that are read by the `server/server.js` file.
 - `uuid`: the `uuid` module is used to generate universally unique IDs. An example usage is using them as tokens for user sessions and similar activities.
 - `colors`: the `colors` module is really just used to style text output in the console, and that's what it's supposed to be used for.

### Git Installation

To clone Schedule's repository to your machine and use it, you need git. Although you can use other alternatives like GitHub's CLI utility, here I will be using git.

If you don't have git, you can install it by running the following commands in your shell:

**Ubuntu/Debian:**

```bash
sudo apt -y install git
```

**Fedora:**

```bash
sudo dnf install git
```

**RedHat/CentOS:**

```bash
sudo yum -y install git
```

Git's version or presence on the machine can be checked by running the following in your shell:

```bash
git --version
```

## Repository Cloning

Before you start cloning using git, make sure you have git present on your machine. If you don't have git, proceed with [this section](#git-installation) first. Otherwise, make sure you are in your desired working directory (in your shell). If you want to clone Schedule to the your home directory, issue the following to change your current working directory to your home directory in your shell:

```bash
cd ~
```

To clone Schedule's repository, run the following command in your shell:

```bash
git clone https://github.com/msfninja/schedule.git
```

This should clone Schedule's repository to your current working directory. You can check if it's cloned by listing your current working directory contents that contain `schedule` by running the following:

```bash
ls -al|grep schedule
```

Or you can simply try to go to the cloned directory by running the following in your shell:

```bash
cd schedule
```

After successfully cloning Schedule's repository to your machine, you can proceed with installing other necessary npm modules [here](#other-modules).

## Initial Configuration

Before you can actually run the server (`server/server.js` file), you need to run the `configure` file to set the project up.

To run `configure`, change your current working directory to the project's root directory, and run the following in your shell:

```bash
./configure
```

This will create the `schedule` directory in your home directory with additional directories that will later store user data, root account data, various authentication data and public data to be displayed in the web client of Schedule.

**Important: make sure you will be running the node server as the same user you were running the `configure` file, otherwise the server won't run properly by reading a different home directory than the `configure` file created the `schedule` directory in.**

## Server

There are more things to do before running the `server/server.js` file. Schedule has several features which require its traffic to go over HTTPS, rather than HTTP. First of, passwords and other sensitive information are being transmitted. Also, schedule offers a PWA functionality, which requires HTTPS traffic.

### SSL Certificate (And PWA)

If you have an SSL certificate, put it and the rest that belongs to it into the `server/ssl` directory, and rename the key file to `key.pem`, and the certificate file to `cert.pem`.

To generate a self-signed SSL certificate using `openssl`, go to the `server/ssl` directory:

```bash
cd server/ssl
```

And run the following commands in your shell:

```bash
openssl genrsa -out key.pem
openssl req -new -key key.pem -out csr.pem
openssl x509 -req -days 9999 -in csr.pem -signkey key.pem -out cert.pem
rm csr.pem
```

This will leave you with two files: `cert.pem` and `key.pem` (inside the `server/ssl` directory). That is all you need to do. The server file will utilize these files.

### Server Initiation

**Important: before you can run the server, you need to run the `configure` file. Otherwise the node app will exit with an error. Go to [this section](#initial-configuration) to get started with the `configure` file.**

If you're ready, you can initialize the server. Go to the `server` directory:

```bash
cd server
```

And initiate the node server by running this command in your shell:

```bash
nodemon server.js --ignore '*.json'
```

The `--ignore` option is set to `'*.json'` so the server won't reinitiate every time there is a change to any JSON file within the project directory.

### Server Configuration

Server configuration is not very broad, but present nevertheless. Common hand-picked values that are used throughout the `server/server.js` file are collected in the `config.yml` file in the root directory of the project. If you need to change something miscellaneous, you can try to find the property there.

For example, if you'd like to change the port, you can search for these lines:

```yaml
server:
  port: 150
```

Where assumably the default number 150 represents the port. Changing this to a value that is not a valid TCP/UDP port will result in an error upon initiating the server.

### Compiling Sass Code

Make sure you have Sass installed before proceeding with this section. To see how to install Sass, follow [this section](#sass-installation) first.

So far, Schedule has only one Sass style sheet. To compile it into CSS code that is being served to the client, run the below command in your shell (assuming your current working directory is the project's root directory):

```bash
sass ./server/client/sass/stylesheet.sass ./public/client/css/stylesheet.css
```

This will compile the code only once though. If you want to automate the compilation process, you can add the `-w` option like this:

```bash
sass -w ./server/client/sass/stylesheet.sass ./public/client/stylesheet.css
```

By default, sass will also make a source map along the compiled CSS style sheet. If you don't want a source map, you can add the `--no-source-map` option.

### Compiling CoffeeScript Code

Make sure you have CoffeeScript installed before proceeding with this section. To see how to install CoffeeScript, follow [this section](#coffeescript-installation) first.

Schedule has 2 CoffeeScript scripts, which are `server/client/coffee/main.coffee` and `server/client/coffee/user.coffee`. Both can be compiled into JavaScript code that will be served to the client issuing the following two commands in your shell respectively:

```bash
coffee -o ./public/client/js/main.js -c ./server/client/coffee/main.coffee
```

```bash
coffee -o ./public/client/js/user.js -c ./server/client/coffee/user.coffee
```

If you want to compile the CoffeeScript code on every change to the `.coffee` files, you can change the `-c` option to `-w`, for example like this:

```bash
coffee -o ./public/client/js/main.js -w ./server/client/coffee/main.coffee
```

## Support

If it happens that you need support setting up or configuring Schedule, or you have a question or idea, you can reach me out on the `#schedule` channel of the freenode IRC server (where I'm present 24/7, so any message sent there will be seen by me), or mail me to [msfninja@airmail.cc](mailto:msfninja@airmail.cc).

You can always report issues and create pull requests on Schedule's [GitHub repository](https://github.com/msfninja/schedule).

## Notes

<span id="ref-1">1.</span> <b><a title="Jump up" href="#l-ref-1">^</a></b> The scope of what devices you can use to access Schedule depends on how your network on which the server runs is configured. If you have configured your router's network address translation (NAT) in regard to your server such for it to be accessible to the World Wide Web (WWW) (which, in case of the absence of such a feature, can be organized with your internet service provider (ISP)), then Schedule would indeed be accessible from any device in the world (with some configurations/routers, it is possible that those devices connected to the same local area network (LAN) to which the server is connected to will not be able to communicate with the server (in cases where you use the IP address of the server, as that is the router's default gateway)).

<span id="ref-2">2.</span> <b><a title="Jump up" href="#l-ref-2">^</a></b> If you install Schedule as a PWA on your device, you will be accessing it from an imitated app, but technically still a browser.

<span id="ref-3">3.</span> <b><a title="Jump up" href="#l-ref-3">^</a></b> User account data (that is saved in the long term by the server unless a user request to delete the data is presented) includes but is not limited to the following: username (this is **not** kept encrypted however, otherwise there would be no way to identify users with Schedule's current design); user password; user to-dos; user notes; and user calendar events.

<span id="ref-4">4.</span> <b><a title="Jump up" href="#l-ref-4">^</a></b> When I'm referring to myself throughout this file and project, I'm referring to me as to msfninja.

<span id="ref-5">5.</span> <b><a title="Jump up" href="#l-ref-5">^</a></b> If you need a different configuration for an npm package/module installation, you can run `npm i --help` to get a list of possible options to be used.