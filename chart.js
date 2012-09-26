/*jslint white: true */
var Settings = {
  startYear: 2006,
  startMonth: 9,
  endYear: 2012,
  width: 12000,
  height: 160,

  day_w: 4,
  hour_h: 4,
  day_gap: 1,
  hour_gap: 1,

  dows: ["S", "M", "T", "W", "T", "F", "S"],
  moys: ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"],

  legendColor: "#ccc",
};

var Chart = function(name, title) {
  this.name    = name;
  this.title   = title;
  this.canvas  = document.getElementById(name + "-canvas");
  this.context = this.canvas.getContext('2d');

  this.position = 0;

  this.context.fillText("Loading...", 10, 10);
  this.colors  = [
    "#00f",
    "#f60",
    "#3f3",
    "#33e6d9",
    "#555",

    "#FFA600",
    "#A64B00",
    "#8CCCF2",
    "#ED0000",
    "#A6FF00",
    "#8C19A3",
    "#00AAE6",
    "#5CF22C",
    "#FF6600",
    "#806600",
    "#0057D9",
  ];

  this.daysSinceStart = function(date) {
    var startDate = new Date(Settings.startYear + "-" + Settings.startMonth + "-01 00:00:00");
    var days = parseInt((date - startDate) / 86400000, 10);

    return(days);
  };

  this.coordForTime = function (days, hour, y) {
    return [ days*(Settings.day_w + Settings.day_gap), y - hour*(Settings.hour_h + Settings.hour_gap) ];
  };

  this.hourLine = function(hour) {
    this.context.moveTo(0, 160 - hour*(Settings.hour_h + Settings.hour_gap));
    this.context.lineTo(Settings.width, 160 - hour*(Settings.hour_h + Settings.hour_gap));
  };

  this.dayLine = function(day, text, offset) {
    if (typeof(day) === "string") {
      day = new Date(day);
    }
    var days = this.daysSinceStart(day);

    var pos  = this.coordForTime(days, 0, 160);
    if (typeof(text) === "string") {
      this.context.font = "9px Helvetica";
      this.context.fillText(text, pos[0], pos[1] + offset);
    }

    this.context.moveTo(pos[0], pos[1]);
    pos  = this.coordForTime(days, 23, 160);
    this.context.lineTo(pos[0], pos[1]);
  };


  this.clear = function() {
    this.context.fillStyle = "#ffffff";
    this.context.fillRect(0, 0, Settings.width, 240);
  };

  this.drawGrid = function() {
    this.context.stokeStyle = "#ff0000";
    this.context.fillStyle  = "#000000";
    this.context.lineWidth = 0.1;
    this.context.beginPath();
    var i, j;
    for(i = 0; i < 24; i++) {
      this.hourLine(i);
    }

    for(i = Settings.startYear; i < Settings.endYear+1; i++) {
      this.dayLine(i.toString() + "-01-01 00:00:00", i.toString(), 20);

      for(j = 1; j < 13; j++) {
        this.dayLine(i.toString() + "-" + j + "-01 00:00:00", j.toString(), 30);
      }
    }

    // Custom hour markers
    this.hourLine(9);
    this.hourLine(12);
    this.hourLine(18);
    this.hourLine(20);

    this.context.stroke();
  };

  this.drawHeader = function(text) {
    var font = this.context.font;
    this.context.fillStyle = "#000000";
    this.context.font = "32px Helvetica";
    this.context.fillText(text, 10, 40);
    this.context.font = font;
  };

  this.drawLegendSmall = function(text, x, y) {
    this.context.fillStyle = "#000000";
    this.context.font = "8px Helvetica";
    this.context.fillText(text, x, y);
  };

  this.drawWeekends = function() {
    var days = new Date(Settings.endYear.toString() + "-12-31").getTime();
    var startDate = new Date(Settings.startYear.toString() + "-" + Settings.startMonth + "-01").getTime();
    this.context.beginPath();
    this.context.fillStyle = "#f00";
    this.context.strokeStyle = "#f00";
    var day;
    for (day = startDate; day < days; day+=8640000)
    {
      var d = new Date(day);
      var dow = d.getDay();

      if (dow === 0 || dow === 6) {
        this.dayLine(d);
      }
    }
    this.context.stroke();
  };

  this.drawWeekdays = function() {
    var days = new Date(Settings.endYear.toString() + "-12-31").getTime();
    var startDate = new Date(Settings.startYear.toString() + "-" + Settings.startMonth + "-01").getTime();
    this.context.beginPath();
    this.context.fillStyle = "#ccc";
    this.context.strokeStyle = "#ccc";
    this.context.lineWidth = 0.1;
    var day;
    for (day = startDate; day < days; day+=8640000)
    {
      var d = new Date(day);
      var dow = d.getDay();

      if (dow !== 0 && dow !== 6) {
        this.dayLine(d);
      }
    }
    this.context.stroke();
  };

  this.drawHolidays = function() {
    this.context.beginPath();
    this.context.fillStyle = "#f00";
    this.context.strokeStyle = "#f00";
    this.context.lineWidth = 0.7;
    var self = this;
    window.holidays.forEach(function(holiday) {
      self.dayLine(holiday.date);
    });
    this.context.stroke();
  };

  this.drawSummary = function(values, x, factor, width, legend) {
    if (typeof(width) === "undefined") {
      width = 10;
    }
    if (typeof(legend) === "undefined") {
      legend = function(item) { return(item.key); };
    }

    var i = 0;
    var self = this;
    values.forEach(function (item) {
      self.context.fillStyle = Settings.legendColor;
      var val = item.value / factor;
      self.context.fillRect(x+i*width+3, 30 - val, width-1, val);
      self.drawLegendSmall(legend(item), x + i*width+3, 30 + 8);
      i++;
    });
  };

  this.draw = function(values, group, filters) {
    var i, j;
    var days, pos;
    var legend = document.getElementById("color-legend-" + this.name);
    legend.innerHTML = "";

    if (typeof(group) === "undefined") {
      group = "company";
    }

    this.clear();

    this.context.globalAlpha = 1.0;
    this.drawHeader(this.title);
    this.drawGrid();

    this.drawWeekends();
    this.drawWeekdays();
    this.drawHolidays();

    var lastGroup = "";
    var colorIndex = -1;

    var sorter = function(a, b) {
      var ret = a[group] === b[group] ? 0 : ( a[group] < b[group] ? -1 : 1 );
      return ret;
    };
    var self = this;

    values.sort(sorter).forEach(function(value) {
      var days = self.daysSinceStart(value.date);
      var pos  = self.coordForTime(days, value.date.getHours(), 160);
      if (lastGroup !== String(value[group])) {
        lastGroup = String(value[group]);
        colorIndex++;
        if (colorIndex > self.colors.length - 1) { colorIndex = 0; }
        self.context.fillStyle = self.colors[colorIndex];

        var li = document.createElement("li");
        li.innerHTML = '<span class="legend" style="background-color: ' + self.colors[colorIndex] + ';">&nbsp;</span>' + lastGroup;
        legend.appendChild(li);
      }

      if (typeof(filters) !== "undefined")
      {
        var filtered = false;
        var i;
        for (i in filters) {
          if (filters[i] !== "" && value[i] !== filters[i]) {
            filtered = true;
          }
        }
        self.context.fillStyle = filtered ? "#ccc" : self.colors[colorIndex];
      }

      self.context.fillRect(pos[0]-Settings.day_w/2, pos[1]-Settings.hour_h/2, Settings.day_w, Settings.hour_h);
    });
  };

  this.drawSummaries = function(summaries, factor) {
    this.drawSummary(summaries[0], 200, factor,     10, function (item) { return (Settings.moys[item.key]); });
    this.drawSummary(summaries[1], 350, factor / 3  );
    this.drawSummary(summaries[2], 700, factor,     10, function (item) { return (Settings.dows[item.key]); });
    this.drawSummary(summaries[3], 800, factor / 2  );
  };

  this.drawAnnotations = function() {
    var i;
    for (i=0; i<window.annotations.length; i++) {
      var annotation = window.annotations[i];

      if (annotation.category === this.name) {
        var days = this.daysSinceStart(annotation.date);
        var pos  = this.coordForTime(days, 0, 200);

        this.context.strokeStyle = "#3333ff";
        this.context.fillStyle = "#3333ff";
        this.context.lineWidth = 0.7;
        this.context.beginPath();
        this.context.moveTo(pos[0] + 2, pos[1] + annotation.pos * 12);
        this.context.lineTo(pos[0] + 2, 160);
        this.context.stroke();
        this.context.font = "10px Helvetica";
        this.context.fillText(annotation.text, pos[0] + 5, pos[1] + annotation.pos * 12);
        this.context.strokeStyle = "#000";
        this.context.fillStyle = "#000";
      }
    }
  };
};

