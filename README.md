Anki Sitelock
=============

A firefox addon that helps with consistant studying of Anki cards by blocking websites.

Anki Sitelock blocks a configurable list of websites. To unlock one, you spend credits, which you earn by studying in Anki. Once unlocked, it stays accessible for a limited time window, before it gets locked again. Syncing between Anki and the extension is done with [AnkiConnect](https://ankiweb.net/shared/info/2055492159).

Note: This project is not done, and is yet to uploaded to mozilla's servers! See 'Running' tab to run it locally.

Features
--------

- Block any website you add to your lock list
- Configurable values through the settings panel
- Credit system implemented based on Anki activity


Usage
-----
Before using the extension, you have to configure the values it uses. To do that, you need to
- Click Anki Sitelock's icon in the extension toolbar, or the dropdown menu.
- Open the settings page.
- Add the websites to lock, the name of your decks in Anki to check, and configure other values

Requirements
------------

- Firefox
- Anki version 2.1.x or newer
- [AnkiConnect](https://ankiweb.net/shared/info/2055492159) addon installed in Anki

Running
-------

As of now, you can only run the extension locally. To do that, you need to:
- download the source code => head to [Mozilla's debugging page](about:debugging#/runtime/this-firefox) => Click 'Load temporary add-on' => Select the source code.

Known issues
------------

- If only some variables are configured, the lock page doesn't display them properly (undefined)

Future ideas
------------
- Chromium support
- Statistics page
- On-off button in the extension menu
- Sync data to cloud
- UI revamp
- Codebase rewrite

