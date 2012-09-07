window.onload = function() {
  var canvas  = document.getElementById("canvas");
  var context = canvas.getContext('2d');

  var width  = canvas.width;
  var height = canvas.height;
  var day_w  = 5;
  var hour_h = 5;
  var colorIndex = 0;
  var workTimeline = 160;

  function lineAtDate(days) {
    pos  = coordForTime(days, 0);
    context.moveTo(pos[0], pos[1]);
    pos  = coordForTime(days, 23);
    context.lineTo(pos[0], pos[1]);
  }

  function daysSinceStart(str) {
    var startDate = new Date("2006-10-01 00:00:00");
    var date = new Date(str);
    var days = parseInt((date - startDate) / 86400000);

    return(days);
  }

  function coordForTime(days, hour) {
    return [ days*(day_w + 1), workTimeline - hour*(hour_h + 1) ];
  }

  function draw() {
    var x, y, i, j;
    var days, pos;
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);

    // Work
    // draw timeline
    context.stokeStyle = "#000000";
    context.moveTo(0, workTimeline);
    context.lineTo(width, workTimeline);

    // Custom hour markers
    context.moveTo(0, workTimeline - 9*(hour_h + 1));
    context.lineTo(width, workTimeline - 9*(hour_h + 1));
    context.moveTo(0, workTimeline - 12*(hour_h + 1));
    context.lineTo(width, workTimeline - 12*(hour_h + 1));
    context.moveTo(0, workTimeline - 18*(hour_h + 1));
    context.lineTo(width, workTimeline - 18*(hour_h + 1));

    context.stokeStyle = "#ff0000";
    context.fillStyle  = "#000000";
    context.lineWidth = 0.2;
    for(i=1;i<24;i++) {
      context.moveTo(0, workTimeline - i*(hour_h + 1));
      context.lineTo(width, workTimeline - i*(hour_h + 1));
    }

    // Changing jobs
    days = daysSinceStart("2006-10-01 00:00:00");
    lineAtDate(days);
    context.fillText("join AMU", days*(day_w + 1), workTimeline + 40);

    days = daysSinceStart("2008-07-15 00:00:00");
    lineAtDate(days);
    context.fillText("join 3Di", days*(day_w + 1), workTimeline + 40);

    days = daysSinceStart("2011-02-01 00:00:00");
    lineAtDate(days);
    context.fillText("join Pikkle", days*(day_w + 1), workTimeline + 40);

    days = daysSinceStart("2012-05-20 00:00:00");
    lineAtDate(days);
    context.fillText("join KLab", days*(day_w + 1), workTimeline + 40);

    for(i=0;i<10;i++) {
      days = daysSinceStart("" + (2006+i) + "-01-01 00:00:00");
      lineAtDate(days);
      context.fillText("" + (2006+i), days*(day_w + 1), workTimeline + 20);
      for(j=1;j<13;j++) {
        days = daysSinceStart("" + (2006+i) + "-" + j + "-01 00:00:00");
        lineAtDate(days);
        context.fillText("" + (j), days*(day_w + 1), workTimeline + 30);
      }
    }
    context.stroke();


    context.globalAlpha = 0.5;
    for(i in window.CommitData) {
      // project
      var color = window.Colors[colorIndex];
      colorIndex++;
      if (colorIndex > window.Colors.length - 1)
        colorIndex = 0;

      context.fillStyle = color;
      for (ci in window.CommitData[i].commits) {
        var commit = window.CommitData[i].commits[ci];
        var date   = new Date(commit);
        var days   = daysSinceStart(commit);
        var pos    = coordForTime(days, date.getHours());

        context.fillRect(pos[0]-day_w/2, pos[1]-hour_h/2, day_w, hour_h);
      }
    }
    context.globalAlpha = 1.0;
  }

  draw();
}
