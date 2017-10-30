# SubScan

A fast and accurate multi-nameserver subdomain bruteforcer, includes an optional HTTP API for easy integration into other applications. Auto nameserver list downloading with built-in verification reduces false positives and speeds up the process of bruteforcing by pruning servers which did not reply in a timely manner. Results are automatically saved into the reports folder as a csv file. For advanced users; all aspects of the core application can be adjusted with the application arguments.

![Full](http://img.marzavec.com/subscan-full.png "An example of a full scan")

## Getting Started

These instructions will get you a copy of the project up and running on your local machine. See Api Deployment for notes on how to deploy and interact with the API.

### Prerequisites

* [Node JS](https://nodejs.org/en/download/) - Core file interpreter

```
Node JS >= v8.2.1
```

### Installing

Clone or download this git

* `git clone https://github.com/marzavec/subscan.git`

Using your terminal enter the directory

* `cd subscan`

Install the app using npm or yarn

* `npm install`

On the first run a nameserver list will be downloaded and verified, this takes time but only occurs on the first run or when --update is specified.

## Extended Help

![Help](http://img.marzavec.com/subscan-help.png "Output of the built in help command")

* `-d, --domain            Target top level domain`

The target domain to discover, no '/', 'www' or 'http:'. Example: -d lyka.pro

* `-i, --ignore            Comma seperated list of known false positives to ignore`

Some records or nameservers will give false positive results, use this flag to ignore specific ones that are consistently found. Multiple records to ignore can be seperated with a ','. Example: -i 199.59.242.150,11776.bodis.com

* `-l, --limit <n>         Limit UDP socket count (defaults to 150)`

By default the app will allow a maximum of 150 querys to be running at any given time. Increase this to speed up scanning. Too high may result in your ip being flagged for abuse. Example: -l 1000

* `-n, --noreport          Prevent saving of report (disabled by default)`

Disable the report autosave feature

* `-p, --port <n>          Target port to bind the API to (defaults to 7575)`

Target port for the API to bind to, it can then be accessed through http://localhost:7575/ (or other specified port). Example: -p 8080

* `-r, --recordttl <n>     Minimum dns record ttl (defaults to 60)`

Lowering this may increase false positives, increasing may miss valid domains. Some nameserver providers decide that if a subdomain is not found, they will give you a valid record that points to a 'Search Guide Service'. The integrity check attempts to weed these servers out as much as possible. Example: -r 20

* `-t, --timeout <n>       UDP timeout value (milliseconds) (defaults to 10000)`

How long a udp request will wait until timing out, lowering this may increase scan speed. Example: -t 5000

* `-u, --update            Update cached nameserver list file (disabled by default)`

If this flag is present, the software will clear, redownload and verify the nameserver list before moving on to the scan or api host. This is recommended if the app has not been used in a long while. Protip, if you are outside the US, changing line 11 of ./include/OpenDns.js to the correct url of your country will increase scan speed.

* `-v, --verbose           Output found subdomains live (enabled by default)`

If this flag is present it will disable std output of found valid records. (Yea, this needs fixing)

* `-V, --version           Output the version number`

Output version and exit the application.

* `-w, --wordlist [value]  Target wordlist file (defaults to "wordlists/all.txt")`

The target wordlist. All wordlists must be present in the ./wordlist/ directory. Example: -w top_200.txt

## Api Deployment

The API portion of this project is still a work in progress.

## Planned Updates

* Finalize and fix bugs in API for future release
* Restructure DnsHandler class to fix poor init() logic
* Aggregate a better wordlist
* Add iterative scanning (IE a.domain.tld, b.domain.tld, c.domain.tld)

## Contributing

Feel free to contribute using [Github Flow](https://guides.github.com/introduction/flow/). Fork this project, add commits, and then [open a pull request](https://github.com/marzavec/compare/).

## Authors

* **Marzavec** - *Initial Development* - [Marzavec](https://github.com/marzavec)

See also the list of [contributors](https://github.com/marzavec/contributors) who participated in this project.

## License

This project is licensed under the WTF Public License - see the [LICENSE.md](LICENSE.md) file and [http://www.wtfpl.net/about/](http://www.wtfpl.net/about/) for details.

## Acknowledgments

* Thanks to [public-dns.info](https://public-dns.info/) for the public nameserver list files.
* Thanks to [skepticfx](https://github.com/skepticfx/subquest/tree/master/dictionary) for the current wordlist files.
