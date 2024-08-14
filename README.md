# Devolution Studio website

Devolution Studio's presentation website

## System requirements

-   Node > v19
-   NPM > v9.1

## Installing

To install this project, you have to clone this repository, install NPM dependencies and setup ENV vars.

```shell
git clone git@github.com:Devolution-Studio/devolution.studio.git
cd devolution.studio
npm install
cp .env.example .env
```

Do not forget to edit `.env` to set your own settings.

## Usage

### Development

To develop your project, first run `build` command to watch changes and auto-compile app

```shell
cd devolution.studio/
npm run dev
```

Next to this, access to `http://localhost:{PORT}`

Well done !

> This project is setup for Visual Studio Code, check `launch.json` file for more informations

### Production

Nothing special to do except to run `start` instead of `dev`.

```shell
cd devolution.studio/
npm run dev
```

## Official server

-   https://devolution.studio

## Licenses

Devolution Studio, all right reserved
Template from https://preview.themeforest.net/item/stukram-ajax-agency-portfolio-template/full_screen_preview/27663380
