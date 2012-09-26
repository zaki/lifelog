window.onload = function() {
  function drawCommits(groups, filters) {
    var chart = new Chart("commit", "Commits");
    chart.draw(window.commits, groups, filters);
    chart.drawSummaries([
      window.commitsPerMonth.all(),
      window.commitsPerDay.all(),
      window.commitsPerDOW.all(),
      window.commitsPerHour.all(),
    ], 100);
    chart.drawSummary(window.commitsPerLanguage.all(), 1084, 100, 35, function(x) {
      var map = { "javascript": "js", "coffeescript": "coffee", "objective-c": "obj-c" }
      return((map[x.key] || x.key).toUpperCase());
    });
    chart.drawAnnotations();
  }

  function drawEmails() {
    var chart = new Chart("email", "Email sent");
    chart.draw(window.emails, "account");
    chart.drawSummaries([
      window.emailsPerMonth.all(),
      window.emailsPerDay.all(),
      window.emailsPerDOW.all(),
      window.emailsPerHour.all(),
    ], 30);
    chart.drawAnnotations();
  }

  function drawSocial() {
    var chart = new Chart("social", "Social");
    chart.colors = ["#3b5998", "#9ae4e8"];
    chart.draw(window.social, "service");
    chart.drawSummaries([
      window.postsPerMonth.all(),
      window.postsPerDay.all(),
      window.postsPerDOW.all(),
      window.postsPerHour.all(),
    ], 30);
    chart.drawAnnotations();
  }

  function drawIM() {
    var chart = new Chart("im", "IM");
    chart.draw(window.ims, "service");
    chart.drawSummaries([
      window.imPerMonth.all(),
      window.imPerDay.all(),
      window.imPerDOW.all(),
      window.imPerHour.all(),
    ], 1000);
    chart.drawAnnotations();
  }
  //{{{ - Data loading
  function loadAnnotations() {
    d3.csv("http://rody.dev/data/holiday", function(posts) {
      posts.forEach(function(post, index) {
        post.index = index;
        post.date  = new Date(post.date);
      });

      window.holidays = posts;
    });
    d3.csv("http://rody.dev/data/annotations", function(posts) {
      posts.forEach(function(post, index) {
        post.index = index;
        post.date  = new Date(post.date);
      });
      window.annotations = posts;

      loadData();
    });
  }

  function loadData() {
    d3.csv("http://rody.dev/data/commits", function(commits) {
      commits.forEach(function(commit, index) {
        commit.index = index;
        commit.date  = new Date(commit.date);
      });

      var identity = function(x) { return x; };
      var cCommits = crossfilter(commits);
      var commitsByMonth  = cCommits.dimension(function(commit) { return commit.date.getMonth(); });
      var commitsPerMonth = commitsByMonth.group(identity);
      var commitsByDay    = cCommits.dimension(function(commit) { return commit.date.getDate(); });
      var commitsPerDay   = commitsByDay.group(identity);
      var commitsByDOW    = cCommits.dimension(function(commit) { return commit.date.getDay(); });
      var commitsPerDOW   = commitsByDOW.group(identity);
      var commitsByHour   = cCommits.dimension(function(commit) { return commit.date.getHours(); });
      var commitsPerHour  = commitsByHour.group(identity);
      var commitsByLanguage  = cCommits.dimension(function(commit) { return commit.language; });
      var commitsPerLanguage = commitsByLanguage.group(identity);
      window.commits = commits;
      window.commitsPerMonth = commitsPerMonth;
      window.commitsPerDay = commitsPerDay;
      window.commitsPerDOW = commitsPerDOW;
      window.commitsPerHour = commitsPerHour;
      window.commitsPerLanguage = commitsPerLanguage;
      drawCommits();
    });
    d3.csv("http://rody.dev/data/emails", function(emails) {
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
    d3.csv("http://rody.dev/data/social", function(posts) {
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
    d3.csv("http://rody.dev/data/im", function(posts) {
      posts.forEach(function(post, index) {
        post.index = index;
        post.date  = new Date(post.date);
      });

      var cIM = crossfilter(posts);
      var imByMonth  = cIM.dimension(function(post) { return post.date.getMonth(); });
      var imPerMonth = imByMonth.group(function(c) { return c; });
      var imByDay    = cIM.dimension(function(post) { return post.date.getDate(); });
      var imPerDay   = imByDay.group(function(c) { return c; });
      var imByDOW    = cIM.dimension(function(post) { return post.date.getDay(); });
      var imPerDOW   = imByDOW.group(function(c) { return c; });
      var imByHour   = cIM.dimension(function(post) { return post.date.getHours(); });
      var imPerHour  = imByHour.group(function(c) { return c; });

      window.imPerMonth = imPerMonth;
      window.imPerDay = imPerDay;
      window.imPerDOW = imPerDOW;
      window.imPerHour = imPerHour;
      window.ims = posts;
      drawIM();
    });
  }

  loadAnnotations();
  document.getElementById("refresh").onclick = function(e) {
    var groups = null;
    var filter = null;
    var radios = document.getElementsByName("color[]");
    for (var i in radios) {
      if (radios[i].checked) {
        groups = radios[i].value;
      }
    }
    var companySelect = document.getElementById("company-filter");
    var company = companySelect.value;

    console.log(groups, company);
    if (groups)
      drawCommits(groups, {company: company} );
  }
}

