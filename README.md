This plugin for the ``gh-edu`` exosystem has been created to manage and store various student information.

## Installation

```
gh edu install data
```

## Usage

```
gh edu data -h 
Usage: gh-edu-data [options] [command]

Options:
  -h, --help                 display help for command

Commands:
  log [options] <inputFile>  Get relevant information about you students
  teams [options]            Get relevant information about you students using
                             teams
  team-add [options]         Create teams with certain patterns to get
                             information later on. Empty spaces will become '-'
  help [command]             display help for command
```

```
➜  gh-edu-data git:(casiano) ✗ gh edu data teams -h
Usage: gh-edu-data teams [options]

Get relevant information about you students using teams

Options:
  -o, --output <outputFile>  File to write the resulting data. If not specified
                             it will write the result to the standard output
  -c, --cache                Cache the information in the configuration file
  -q, --quiet                Don't show any output, except errors
  -h, --help                 display help for command
```


## team

By default this is the regular expression for the *individual identification teams*:

```
➜  gh-edu git:(subst-organization-by-org) ✗ gh edu get -t
(?<name>.+)[-_](?<id>.+)
``` 

We also need to set a default org:

```
➜  gh-edu-data git:(casiano) ✗ gh edu set -o 'ULL-ESIT-PL-2122'
Not in cache. Fetching... (Cache will be updated)
➜  gh-edu-data git:(casiano) ✗ gh edu get -o
ULL-ESIT-PL-2122
```

Once we have set the default org and the individual identification can be obtained using the command `gh edu data teams`.
The command outputs to stderr those teams with multiple members:

```json
➜  gh-edu-data git:(casiano) ✗ gh edu data teams
Warning! Teams with several members not included in the identification process: {
  "casiano-rodriguez-leon-crguezl": [
    "https://github.com/crguezl",
    "https://github.com/algorithms-ull"
  ]
}
```

And re-directs to stdout the individual identification teams:

```json
[
  {
    "url": "https://github.com/AdalDiazFarina",
    "email": "",
    "nameInGH": "Adal Díaz Fariña",
    "name": "adal-diaz-fariña",
    "id": "alu0101112251"
  },
  ... etc.
  {
    "url": "https://github.com/casiano",
    "email": "crguezl@ull.edu.es",
    "nameInGH": "Casiano",
    "name": "casiano-rodriguez-leon",
    "id": "alumno5"
  },
  {
    "url": "https://github.com/GGCristo",
    "email": "alu0101204512@ull.edu.es",
    "nameInGH": "Cristo García",
    "name": "cristo-garcia-gonzalez",
    "id": "alu0101204512"
  },
  ...
]
```

## log

The log option has no use in its current version. Will be removed