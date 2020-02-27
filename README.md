# ![logo](https://raw.githubusercontent.com/sagemathinc/smc/master/src/webapp-lib/favicon-32x32.png) CoCalc

#### _Collaborative Calculation in the Cloud_

**CoCalc** offers collaborative calculation in the cloud.
This includes working with the full (scientific) Python stack, SageMath, Julia, R, Octave, and more.
It also offers capabilities to author documents in LaTeX, R/knitr or Markdown,
storing and organizing files, a web-based Linux Terminal,
communication tools like a chat, course management and more.

## Website

   * **[CoCalc](https://cocalc.com) -- the online service**
   * [Github](https://github.com/sagemathinc/cocalc)
   * [Mailing List](https://groups.google.com/forum/#!forum/cocalc)

## Very easy install of CoCalc on your computer

You can easily use CoCalc on your own computer for free by **[running a Docker image](https://github.com/sagemathinc/cocalc-docker)**.

## History

*CoCalc* was formerly called *SageMathCloud*.
It started to offer way more than just SageMath and hence outgrew itself.
The name was coined in fall 2016 and changed around spring 2017.

## Contributors

### Current highly active contributors

   * Harald Schilly
   * Hal Snyder
   * William Stein
   * Travis Scholl

### Past contributors

   * John Jeng
   * Greg Bard
   * Rob Beezer
   * Keith Clawson
   * Tim Clemans
   * Andy Huchala
   * Jon Lee
   * Simon Luu
   * Nicholas Ruhland
   * Todd Zimmerman

... and *many* others: See https://github.com/sagemathinc/cocalc/graphs/contributors

## Copyright/License

The copyright of CoCalc is owned by SageMath, Inc., and the source code
here is released under the GNU Affero General Public License version 3+.
See the included file LICENSE.md.

None of the frontend or server dependencies of SMC are themselves GPL
licensed; they all have non-viral liberal licenses.   If want to host
your own SMC at a company, and need a different AGPL-free license,
please contact help@sagemath.com.

## Trademark

"CoCalc" is a [registered trademark](http://tsdr.uspto.gov/#caseNumber=87155974&caseType=SERIAL_NO&searchType=statusSearch).

## ARCHITECTURE

  * Client       -- javascript client library that runs in web browser
  * Load balancer/ssl -- HAproxy
  * Database     -- PostgreSQL
  * Compute      -- VM's running TCP servers (e.g., sage, console, projects, python3, R, etc.)
  * Hub          -- written in Node.js; primus server; connects with *everything* -- compute servers, database, other hubs, and clients.
  * Storage      -- Snapshots of project data
  * HTTP server  -- Nginx

### Architectural Diagram
```

   Client    Client    Client   Client  ...
     /|\
      |
   https://cocalc.com (primus)
      |
      |
     \|/
 HAproxy (load balancing...)HAproxy                  Admin     (monitor and control system)
 /|\       /|\      /|\      /|\
  |         |        |        |
  |http1.1  |        |        |
  |         |        |        |
 \|/       \|/      \|/      \|/
 Hub<----> Hub<---->Hub<---> Hub  <-----------> PostgreSQL <--> PostgreSQL  <--> PostgreSQL ...
           /|\      /|\      /|\
            |        |        |
   ---------|        |        | (tcp)
   |                 |        |
   |                 |        |
  \|/               \|/      \|/
 Compute<-------->Compute<-->Compute <--- rsync replication  to Storage Server, which has ZFS snapshots

```

## Acknowledgements

### Browserstack

We are grateful to BrowserStack for providing infrastructure to test CoCalc. 

<a href="https://www.browserstack.com" target="_blank"><img src="http://i.imgur.com/VProOTR.png"></a>

## Development

### Prerequisites

* node
* Postgres
* `pip install pyyaml; pip3 install pyyaml`

## Installation

The following instruction **don't** install CoCalc. They're for development purposes only!

   * Install node.js version 10.x (we don't support 12.x as of Feb 2020).
   * `git clone --recurse-submodules https://github.com/sagemathinc/cocalc` -- copy repo
   * `cd cocalc/src`
   * `npm run install-all` -- build
   * `npm test` -- run test suite (expected failures if your clock is not UTC)
   * `install.py all --compute --web` -- build and install some parts system-wide for development use
   * See `INSTALL.md` for more details.

For further options please [go here](https://github.com/sagemathinc/cocalc/tree/master/src/dev).
