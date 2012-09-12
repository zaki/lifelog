window.onload = function() {
  var canvas  = document.getElementById("canvas");
  var context = canvas.getContext('2d');

  var width        = canvas.width;
  var height       = canvas.height;
  var day_w        = 4;
  var hour_h       = 4;
  var day_gap      = 1;
  var hour_gap     = 1;
  var colorIndex   = 0;
  var startYear    = 2006;
  var endYear      = 2013;
  var startMonth   = 9;
  var legendColor  = "#cccccc";

  function daysSinceStart(date) {
    var startDate = new Date("" + startYear + "-" + startMonth + "-01 00:00:00");
    var days = parseInt((date - startDate) / 86400000);

    return(days);
  }

  function coordForTime(days, hour, y) {
    return [ days*(day_w + day_gap), y - hour*(hour_h + hour_gap) ];
  }

  function hourLine(hour, y) {
    context.moveTo(0, y - hour*(hour_h + hour_gap));
    context.lineTo(width, y - hour*(hour_h + hour_gap));
  }

  function dayLine(day, y, text, offset) {
    if (typeof(day) === "string") {
      day = new Date(day);
    }
    var days = daysSinceStart(day);

    var pos  = coordForTime(days, 0, y);
    if (typeof(text) === "string") {
      context.font = "9px Helvetica";
      context.fillText(text, pos[0], pos[1] + offset);
    }

    context.moveTo(pos[0], pos[1]);
    pos  = coordForTime(days, 23, y);
    context.lineTo(pos[0], pos[1]);

  }

  //{{{ - Drawing
  function clear(y) {
    context.fillStyle = "#ffffff";
    context.fillRect(0, y - 160, width, y + 16);
  }

  function drawGrid(x, y) {
    context.stokeStyle = "#ff0000";
    context.fillStyle  = "#000000";
    context.lineWidth = 0.1;
    for(i=0;i<24;i++) {
      hourLine(i, y);
    }

    for(i=startYear;i<endYear+1;i++) {
      dayLine(""+(i) + "-01-01 00:00:00", y, ""+(i), 20);

      for(j=1;j<13;j++) {
        dayLine("" + (i) + "-" + j + "-01 00:00:00", y, ""+(j), 30);
      }
    }

    // Custom hour markers
    hourLine(9, y);
    hourLine(12, y);
    hourLine(18, y);
    hourLine(20, y);

    context.stroke();
  }

  function drawHeader(text, x, y) {
    var font = context.font;
    context.fillStyle = "#000000";
    context.font = "32px Helvetica";
    context.fillText(text, x, y);
    context.font = font;
  }

  function drawLegendSmall(text, x, y) {
    context.fillStyle = "#000000";
    context.font = "8px Helvetica";
    context.fillText(text, x, y);
  }

  function drawSummaries(summaries, y, factor) {
    summaries[0].forEach(function (month) {
      context.fillStyle = legendColor;
      var val = month.value / factor;
      context.fillRect(200+month.key*10+3, y - val, 9, val);
      drawLegendSmall(""+(month.key+1), 200+month.key*10+3, y + 8);
    });

    summaries[1].forEach(function (day) {
      context.fillStyle = legendColor;
      var val = day.value / (factor / 3);
      context.fillRect(350+day.key*10+3, y - val, 9, val);
      drawLegendSmall(""+(day.key), 350+day.key*10+3, y + 8);
    });
    summaries[2].forEach(function (dow) {
      context.fillStyle = legendColor;
      var val = dow.value / factor;
      var dows = ["S", "M", "T", "W", "T", "F", "S"];
      context.fillRect(700+dow.key*10+3, y - val, 9, val);
      drawLegendSmall(dows[dow.key], 700+dow.key*10+3, y + 8);
    });
    summaries[3].forEach(function (hour) {
      context.fillStyle = legendColor;
      var val = hour.value / (factor / 2);
      context.fillRect(800+hour.key*10+3, y - val, 9, val);
      drawLegendSmall(""+(hour.key), 800+hour.key*10+3, y + 8);
    });
  }

  function drawAnnotations() {
    for (var i in window.annotations) {
      var annotation = window.annotations[i];

      var days = daysSinceStart(annotation.date);
      var pos  = coordForTime(days, 0, 600);

      context.strokeStyle = "#3333ff";
      context.fillStyle = "#3333ff";
      context.lineWidth = 0.5;
      context.globalAlpha = 0.5;
      context.beginPath();
      context.moveTo(pos[0] + 2, pos[1] + annotation.pos * 12);
      context.lineTo(pos[0] + 2, 30);
      context.stroke();
      context.globalAlpha = 1.0;
      context.font = "10px Helvetica";
      context.fillText(annotation.text, pos[0] + 5, pos[1] + annotation.pos * 12);
    }
  }

  function drawCommits() {
    var x, y, i, j;
    var days, pos;
    var workTimeline = 160;

    clear(workTimeline);

    drawHeader("Commits", 10, workTimeline - 120);
    context.beginPath();
    drawGrid(0, workTimeline);

    var colors = ["#ff6600", "#0000ff", "#ff0000", "#aaaaaa"];
    var lastCompany = "";
    var colorIndex = -1;

    window.commits.forEach(function(commit) {
      var days = daysSinceStart(commit.date);
      var pos  = coordForTime(days, commit.date.getHours(), workTimeline);
      if (lastCompany !== String(commit.company)) {
        lastCompany = String(commit.company);
        colorIndex++;
        context.fillStyle = colors[colorIndex];
      }

      context.fillRect(pos[0]-day_w/2, pos[1]-hour_h/2, day_w, hour_h);
    });

    var summaries = [
      window.commitsPerMonth.all(),
      window.commitsPerDay.all(),
      window.commitsPerDOW.all(),
      window.commitsPerHour.all()
    ];
    drawSummaries(summaries, 30, 100);
  }
  function drawEmails() {
    var x, y, i, j;
    var days, pos;
    var emailTimeline = 360;

    clear(emailTimeline);

    drawHeader("Emails", 10, emailTimeline - 120);
    context.beginPath();
    drawGrid(0, emailTimeline);

    var colors = ["#ff6600", "#0000ff", "#ff0000", "#aaaaaa"];
    var lastAccount = "";
    var colorIndex = -1;

    window.emails.forEach(function(email) {
      var days = daysSinceStart(email.date);
      var pos  = coordForTime(days, email.date.getHours(), emailTimeline);
      if (lastAccount !== String(email.account)) {
        lastAccount = String(email.account);
        colorIndex++;
        context.fillStyle = colors[colorIndex];
      }

      context.fillRect(pos[0]-day_w/2, pos[1]-hour_h/2, day_w, hour_h);
    });

    var summaries = [
      window.emailsPerMonth.all(),
      window.emailsPerDay.all(),
      window.emailsPerDOW.all(),
      window.emailsPerHour.all()
    ];
    drawSummaries(summaries, 230, 10);

  }
  function drawSocial() {
    var x, y, i, j;
    var days, pos;
    var socialTimeline = 560;

    clear(socialTimeline);

    drawHeader("Social Media", 10, socialTimeline - 120);

    context.beginPath();
    drawGrid(0, socialTimeline);

    var colors = ["#9ae4e8", "#3b5998"];
    var lastAccount = "";
    var colorIndex = -1;

    window.social.forEach(function(post) {
      var days = daysSinceStart(post.date);
      var pos  = coordForTime(days, post.date.getHours(), socialTimeline);

      if (lastAccount !== String(post.service)) {
        lastAccount = String(post.service);
        colorIndex++;
        context.fillStyle = colors[colorIndex];
      }

      context.fillRect(pos[0]-day_w/2, pos[1]-hour_h/2, day_w, hour_h);
    });

    var summaries = [
      window.postsPerMonth.all(),
      window.postsPerDay.all(),
      window.postsPerDOW.all(),
      window.postsPerHour.all()
    ];
    drawSummaries(summaries, 430, 10);
  }

  function loadAnnotations() {
    d3.csv("annotation-data.csv", function(posts) {
      posts.forEach(function(post, index) {
        post.index = index;
        post.date  = new Date(post.date);
      });
      window.annotations = posts;

      drawAnnotations();
    });
  }
  //}}}

  context.fillText("Loading commits...", 10, 10);
  context.fillText("Loading emails...",  10, 240);
  context.fillText("Loading social...",  10, 480);

  d3.csv("commit-data.csv", function(commits) {
    commits.forEach(function(commit, index) {
      commit.index = index;
      commit.date  = new Date(commit.date);
    });

    var cCommits = crossfilter(commits);
    var commitsByMonth  = cCommits.dimension(function(commit) { return commit.date.getMonth(); });
    var commitsPerMonth = commitsByMonth.group(function(c) { return c; });
    var commitsByDay    = cCommits.dimension(function(commit) { return commit.date.getDate(); });
    var commitsPerDay   = commitsByDay.group(function(c) { return c; });
    var commitsByDOW    = cCommits.dimension(function(commit) { return commit.date.getDay(); });
    var commitsPerDOW   = commitsByDOW.group(function(c) { return c; });
    var commitsByHour   = cCommits.dimension(function(commit) { return commit.date.getHours(); });
    var commitsPerHour  = commitsByHour.group(function(c) { return c; });
    window.commits = commits;
    window.commitsPerMonth = commitsPerMonth;
    window.commitsPerDay = commitsPerDay;
    window.commitsPerDOW = commitsPerDOW;
    window.commitsPerHour = commitsPerHour;
    drawCommits();

    loadAnnotations();
  });
  d3.csv("email-data.csv", function(emails) {
    emails.forEach(function(email, index) {
      email.index = index;
      email.date  = new Date(email.date);
    });

    var cEmails = crossfilter(emails);
    var emailsByMonth  = cEmails.dimension(function(email) { return email.date.getMonth(); });
    var emailsPerMonth = emailsByMonth.group(function(c) { return c; });
    var emailsByDay    = cEmails.dimension(function(email) { return email.date.getDate(); });
    var emailsPerDay   = emailsByDay.group(function(c) { return c; });
    var emailsByDOW    = cEmails.dimension(function(email) { return email.date.getDay(); });
    var emailsPerDOW   = emailsByDOW.group(function(c) { return c; });
    var emailsByHour   = cEmails.dimension(function(email) { return email.date.getHours(); });
    var emailsPerHour  = emailsByHour.group(function(c) { return c; });

    window.emails = emails;
    window.emailsPerMonth = emailsPerMonth;
    window.emailsPerDay = emailsPerDay;
    window.emailsPerDOW = emailsPerDOW;
    window.emailsPerHour = emailsPerHour;
    drawEmails();
  });
  d3.csv("social-data.csv", function(posts) {
    posts.forEach(function(post, index) {
      post.index = index;
      post.date  = new Date(post.date);
    });

    var cSocial = crossfilter(posts);
    var postsByMonth  = cSocial.dimension(function(post) { return post.date.getMonth(); });
    var postsPerMonth = postsByMonth.group(function(c) { return c; });
    var postsByDay    = cSocial.dimension(function(post) { return post.date.getDate(); });
    var postsPerDay   = postsByDay.group(function(c) { return c; });
    var postsByDOW    = cSocial.dimension(function(post) { return post.date.getDay(); });
    var postsPerDOW   = postsByDOW.group(function(c) { return c; });
    var postsByHour   = cSocial.dimension(function(post) { return post.date.getHours(); });
    var postsPerHour  = postsByHour.group(function(c) { return c; });

    window.postsPerMonth = postsPerMonth;
    window.postsPerDay = postsPerDay;
    window.postsPerDOW = postsPerDOW;
    window.postsPerHour = postsPerHour;
    window.social = posts;
    drawSocial();
  });
}

