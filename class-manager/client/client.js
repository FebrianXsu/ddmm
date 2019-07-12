const discord = require('discord.js'); // Require discord.js to use its Client class

class Client extends discord.Client {
  dms; // NTS: Rename dms to guild
  log;
  general;
  settings;
  ondmsready;

  constructor(settings, logger) {
    logger.debug('Constructing client');

    super(); // Construct the discord.js client

    this.settings = settings; // Use a custom property to store the client's settings
    this.log = logger; // Use a custom property to store a handle to the logger

    this.log.verbose('Logging in');

    // Log the client in using the token stored in settings
    this.login(settings.getValue('token'))
      .catch(this.log.error);
  }

  // Configure a new dms guild to be suitable for use
  initializeDms(dmsGuild) {
    // NTS: Rename dmsGuild
    this.log.debug('Initializing guild');

    this.dms = dmsGuild // Use a custom property to store the dms guild
    this.dms.general = dmsGuild.channels.find(c => c.name == 'general'); // Use a custom property to point to the general channel
    // NTS: Save this channel later maybe?


    let readyState = 0; // The state of initializing the guild

    // Update the ready state and run the callback when all formatting promises are settled
    let ready = function() {
      readyState++; // Update the ready state
      if (readyState == 3 && this.ondmsready) {
        
        this.ondmsready();
      }
    }.bind(this);
    
    // If an attempt was made to initialize a guild that doesn't exist log an error
    if (!dmsGuild) {
      this.log.error('An attempt was made to initialize an invalid guild');
      return;
    }

    // Save the id of the dms guild into the settings
    this.settings.setValue('dms-guild-id', this.dms.id);
    this.settings.save();

    // Delete the General voice channel
    this.log.debug('Deleting General voice channel');
    this.dms.channels.find(c => c.name == 'General').delete().then(ready)
      .catch(this.log.error);

    // Delete the Voice Channels category
    this.log.debug('Deleting Voice Channels category');
    this.dms.channels.find(c => c.name == 'Voice Channels').delete().then(ready)
      .catch(this.log.error);

    // Delete the Text Channels category
    this.log.debug('Deleting Text Channels category');
    this.dms.channels.find(c => c.name == 'Text Channels').delete().then(ready)
      .catch(this.log.error);
  }

  // Add a listener for when the client is ready
  set onready(callback) {
    this.on('ready', callback)
  }

  // Add a listener for when the client is getting a message
  set onmessage(callback) {
    this.on('message', callback);
  }
}

module.exports = Client;