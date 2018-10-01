# Building a PNR status Bot for Facebook Messenger on Hasura

### A Facebook chatbot hosted on Hasura platform to check the PNR status of an Indian Railway ticket in real time.

![Demo](https://github.com/littlewonder/PNR-bot/raw/master/assets/full-demo.gif)

http://littlewonder.github.io/pnrbot

IndianRail.ai tells the latest seat berth status of passenger in Indian Railways i.e. whether passenger has got confirmed reservation, Reservation Against Cancellation (RAC) or the passenger is in waiting list. For waiting list or rac passengers, irctc pnr status might change to confirmed in future if other passengers on this trip cancel their journey. For passengers who have cancelled their trip, it is shown as Can/Mod. It also tells the train name and the charting status. Once final chart is prepared, the status freezes and does not change after that

## On Hasura Hub: https://hasura.io/hub/project/thelittlewonder/pnr-bot

This tutorial is a guide to run a **PNR bot on facebook messenger**, which when given a valid PNR number replies back with the current status of the ticket, along with train details and charting status. You can read the [documentation](https://developers.facebook.com/docs/messenger-platform/quickstart) the Messenger team prepared.

For the chat bot to function we'll need a server that will receive the messages sent by the Facebook users, process this message and respond back to the user. To send messages back to the server we will use the graph API provided by Facebook. For the Facebook servers to talk to our server, the endpoint URL of our server should be accessible to the Facebook server and should use a secure HTTPS URL. For this reason, running our server locally will not work and instead we need to host our server online. In this tutorial, we are going to deploy our server on Hasura which automatically provides SSL-enabled domains.

## Pre-requisites

* [NodeJS](https://nodejs.org)

* [hasura CLI](https://docs.hasura.io/0.15/manual/install-hasura-cli.html)

## Getting the bot running

### Create a facebook application

* Navigate to https://developers.facebook.com/apps/
* Click on **'+ Create a new app’**.

![Fb app screen](https://github.com/littlewonder/PNR-bot/raw/master/assets/Tutorial-1.png)

* Give a display name for your app and your contact email.

![Fb app screen2](https://github.com/littlewonder/PNR-bot/raw/master/assets/Tutorial-2.png)

* In the select a product screen, hover over **Messenger** and click on **Set Up**

![Fb app screen3](https://github.com/littlewonder/PNR-bot/raw/master/assets/Tutorial-3.png)

* To start using the bot, we need a facebook page to host our bot.
  + Scroll over to the **Token Generation** section
  + Choose a page from the dropdown (Incase you do not have a page, create one)
  + Once you have selected a page, a *Page Access Token* will be generated for you.
  + Save this token somewhere.

![Page token](https://github.com/littlewonder/PNR-bot/raw/master/assets/Tutorial-4.png)

* Now, we need to trigger the facebook app to start sending us messages
  - Switch back to the terminal
  - Paste the following command:

```sh
# Replace <PAGE_ACCESS_TOKEN> with the page access token you just generated.
$ curl -X POST "https://graph.facebook.com/v2.6/me/subscribed_apps?access_token=<PAGE_ACCESS_TOKEN>"
```

* In this project, we are making requests to Erail to get the PNR Description for the searched text. Since we are scraping the web,you need not obtain any API Key for this. 

### Getting the Hasura project

```
$ hasura quickstart thelittlewonder/PNR-bot
$ cd PNR-bot
#Add FACEBOOK_VERIFY_TOKEN to secrets. This is any pass phrase that you decide on, keep a note on what you are choosing as your verify token, we will be using it later while setting things up for your bot on the facebook developer page.
$ hasura secrets update bot.fb_verify_token.key <YOUR-VERIFY-TOKEN>
#Add FACEBOOK_PAGE_ACCESS_TOKEN to secrets
$ hasura secrets update bot.fb_page_token.key <YOUR-FB-PAGE-ACCESS-TOKEN>
#Deploy
$ git add . && git commit -m "Deployment commit"
$ git push hasura master
```

After the `git push` completes:

```sh
$ hasura microservice list
```

You will get an output like so:

```sh

INFO Getting microservices...                     
INFO Custom microservices: 
USER MS NAME     STATUS      INTERNAL-URL       EXTERNAL-URL          
bot              Running     bot.default:80     http://bot.deathblow36.hasura-app.io

INFO Hasura microservices: 
HASURA MS NAME     STATUS      INTERNAL-URL                  EXTERNAL-URL
session-redis      Running     session-redis.hasura:6379     
gateway            Running                                   
notify             Running     notify.hasura:80              http://notify.deathblow36.hasura-app.io
le-agent           Running                                   
data               Running     data.hasura:80                http://data.deathblow36.hasura-app.io
platform-sync      Running                                   
postgres           Running     postgres.hasura:5432          
sshd               Running                                   
auth               Running     auth.hasura:80                http://auth.deathblow36.hasura-app.io
filestore          Running     filestore.hasura:80           http://filestore.deathblow36.hasura-app.io

```

Find the EXTERNAL-URL for the service named `bot`(in this case -> https://bot.deathblow36.hasura-app.io).

### Enabling webhooks

In your fb app page, scroll down until you find a card name `Webhooks`. Click on the `setup webhooks` button.

![Enable webhooks2](https://github.com/littlewonder/PNR-bot/raw/master/assets/Tutorial-5.png)

* The `callback URL` is the URL that the facebook servers will hit to verify as well as forward the messages sent to our bot. The nodejs app in this project uses the `/webhook` path as the `callback URL`. Making the `callback URL` https://bot.YOUR-CLUSTER-NAME.hasura-app.io/webhook (in this case -> https://bot.deathblow36.hasura-app.io/webhook/)
* The `verify token`is the verify token that you set in your secrets above (in the command `$ hasura secrets update bot.fb_verify_token.key <YOUR-VERIFY-TOKEN>`)
* After selecting all the `Subsciption Fields`. Submit and save.
* You will also see another section under `Webhooks` that says `Select a page to subscribe your webhook to the page events`, ensure that you select the respective facebook page here.

Next, open up your facebook page.

* Hover over the **Send Message** button and click on Test Button.

* Instead, if your button says **+ Add Button**, click on it.

![Add button](https://github.com/littlewonder/PNR-bot/raw/master/assets/Tutorial-6.png)

* Next, click on **Use our messenger bot**. Then, **Get Started** and finally **Add Button**.
* You will now see that the **+ Add button** has now changed to **Get Started**. Hovering over this will show you a list with an item named **Test this button**. Click on it to start chatting with your bot.
* Send a message to your bot.

Test out your bot. On receiving a search term, it should reply back with the definition/description, straight from its Wiki Article page.

## Support

If you happen to get stuck anywhere, feel free to raise an issue [here](https://github.com/littlewonder/PNR-bot/issues)

Also, you can contact me via [email](mailto:abhi.312.sharma@gmail.com) or [twitter](https://twitter.com/lilwonderspeaks) or [facebook](https://www.fb.com/intellectualbadass).
