# DronePass

DronePass is Air Traffic Control for Drones. It's an airspace authorization and restriction service for homeowners, and a real time drone traffic control system. This repo contains the Homeowner API piece, which allows homeowners to register their land parcels with our Drone Air Traffic Control Aministrator and set special permission times for when drones may fly over their homes. 

The inspiration for this project came from an MIT Technology review [article](http://www.technologyreview.com/news/531811/air-traffic-control-for-drones/) describing the need for a drone air traffic controller by 2018, by which time "7,500 unmanned craft weighing 55 pounds (25 kilograms) or less will be operating in the U.S." We chose to add the Homeowner API in order to ensure that property owners could establish rights over their airspace.

The [Planner](https://github.com/codestork/dronePass-Planner), [Tower](https://github.com/codestork/dronePass-Tower), and [Drone Simulator](https://github.com/codestork/dronePass-DroneSim) make up the remainder of this project's repo. DronePass is deployed at http://dronepass.org and can be viewed on mobile devices as well.

As of right now, only parcels in Alameda county can be registered as homes due to the inconsistent availability of open source land parcel data. Addresses outside of Alameda county can be searched, but will not be registered within our registry database.

## Relation to DronePass System Architecture
![Alt text](/../screenshots/screenshots/landowner.png?raw=true "Location in System Architecture")

## Table of Contents

1. [Usage](#Usage)
1. [Requirements](#requirements)
1. [Development](#development)
    1. [Installing Dependencies](#installing-dependencies)
    1. [Tasks](#tasks)
1. [Team](#team)
1. [Contributing](#contributing)

## Usage

1. Fork this repo to your github account
2. Clone to your local computer
3. From the root directory, run node server.js
4. Head over to http://localhost:3000 to view a local version in your browser
5. Log in and start registering your home!

## Requirements

- Node 0.10.x
- MySQL 2.5.x

## Development

### Installing Dependencies

From within the root directory:

```sh
sudo npm install -g bower
npm install
bower install
```
Ensure you have mysql installed by doing <code>which mysql</code>. If you don't have it, install mysql using <code>brew install mysql</code>.

### Roadmap

View the project roadmap [here](https://github.com/codestork/dronePass-Client/issues)

## Team

  - __Product Owner__: Dave Raleigh
  - __Scrum Master__: Liz Portnoy
  - __Development Team Members__: Dennis Lin, Arthur Chan

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.
