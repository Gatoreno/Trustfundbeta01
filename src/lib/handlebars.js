const { format } = require('timeago.js');
const Handlebars = require('handlebars');
var moment = require('moment');
moment().format();

const helpers = {};

helpers.timeago = (timestamp) => {
    return format(timestamp);
};

Handlebars.registerHelper("switch", function(value, options) {
    this._switch_value_ = value;
    var html = options.fn(this); // Process the body of the switch block
    delete this._switch_value_;
    return html;
  });
  
  Handlebars.registerHelper("case", function(value, options) {
    if (value == this._switch_value_) {
      return options.fn(this);
    }
  });
  
  var DateFormats = {
    short: "DD/MM/YYYY",
    long: "dddd DD.MM.YYYY HH:mm"
};

Handlebars.registerHelper("formatDate", function(datetime, format) {
  if (moment) {
    // can use other formats like 'lll' too
    format = DateFormats[format] || format;
    return moment(datetime).format(format);
  }
  else {
    return datetime;
  }
});

module.exports = helpers