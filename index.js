var express = require("express");
var exphbs = require("express-handlebars");
var hbs = require("handlebars");

hbs.registerHelper("ifCond", function(v1, operator, v2, options) {
  switch (operator) {
    case "==":
      return v1 == v2 ? options.fn(this) : options.inverse(this);
    case "===":
      return v1 === v2 ? options.fn(this) : options.inverse(this);
    case "!=":
      return v1 != v2 ? options.fn(this) : options.inverse(this);
    case "!==":
      return v1 !== v2 ? options.fn(this) : options.inverse(this);
    case "<":
      return v1 < v2 ? options.fn(this) : options.inverse(this);
    case "<=":
      return v1 <= v2 ? options.fn(this) : options.inverse(this);
    case ">":
      return v1 > v2 ? options.fn(this) : options.inverse(this);
    case ">=":
      return v1 >= v2 ? options.fn(this) : options.inverse(this);
    case "&&":
      return v1 && v2 ? options.fn(this) : options.inverse(this);
    case "||":
      return v1 || v2 ? options.fn(this) : options.inverse(this);
    default:
      return options.inverse(this);
  }
});

hbs.registerHelper("if_eq", function(a, b, opts) {
  if (a == b) return opts.fn(this);
  else return opts.inverse(this);
});
hbs.registerHelper("if_not_eq", function(a, b, opts) {
  if (a != b) return opts.fn(this);
  else return opts.inverse(this);
});
hbs.registerHelper("if_mod", function(a, b, opts) {
  var index = opts.data.index;

  if (index % a === b) return opts.fn(this);
  else return opts.inverse(this);
});

hbs.registerHelper("get_darker", function(a, b, opts) {
  var color1 = a;
  var color2 = b;

  function getLightness(hex) {
    // If 3 digits, convert to 6
    if (hex.length === 4) {
      hex += hex.substring(1, 4);
    }

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    var r = parseInt(result[1], 16);
    var g = parseInt(result[2], 16);
    var b = parseInt(result[3], 16);

    (r /= 255), (g /= 255), (b /= 255);
    var max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    var h,
      s,
      l = (max + min) / 2;

    if (max == min) {
      h = s = 0; // achromatic
    } else {
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    s = s * 100;
    s = Math.round(s);
    l = l * 100;
    l = Math.round(l);

    var colorInHSL = "hsl(" + h + ", " + s + "%, " + l + "%)";

    return l;
  }

  // Return color with lower lightness
  return getLightness(color1) < getLightness(color2) ? color1 : color2;
});

hbs.registerHelper("lower_opacity", function(a, opts) {
  var color = a;

  function getRGBA(hex) {
    // If 3 digits, convert to 6
    if (hex.length === 4) {
      hex += hex.substring(1, 4);
    }

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    var r = parseInt(result[1], 16);
    var g = parseInt(result[2], 16);
    var b = parseInt(result[3], 16);
    var a = 0.75;

    var rgba = "rgba(" + r + ", " + g + ", " + b + ", " + a + ")";
    return rgba;
  }

  return getRGBA(color);
});

var app = express();

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

app.use(express.static(__dirname + "/public"));

var projects = require("./public/projects.json");

app.get("/", function(req, res) {
  // Filter out private and archived projects
  var gallery = [];
  var projectArray = projects.projects;
  var i;
  for (i = 0; i < projectArray.length; i++) {
    if (!projectArray[i].archive && !projectArray[i].private) {
      gallery.push(projectArray[i]);
    }
  }

  res.render("home", {
    gallery,
    title: "JACLYN",
    url: "",
    description:
      "Designer & HCI second-year at UCSD that is passionate about the visual process & implementation.",
    home: true
  });
});

app.get("/about", function(req, res) {
  res.render("about", {
    projects,
    title: "About Jaclyn",
    h1: "<span id='about-tagline'> More About Me. <wbr></span>",
    url: "about",
    description:
      "Designer & HCI second-year at UCSD that is passionate about the visual process & implementation."
  });
});

app.get("/contact", function(req, res) {
 res.render("contact", {
    projects,
    title: "Contact Me",
    h1: "<span id='about-tagline'> Contact me. <wbr></span>",
    url: "contact",
    description:
      "Designer & HCI second-year at UCSD that is passionate about the visual process & implementation."
  });
});

app.get("/:project", function(req, res) {
  var inputTitle = req.params.project;

  // Check if valid project url
  var projectArray = projects.projects;

  for (var i = 0; i < projectArray.length; i++) {
    var currProject = projectArray[i];

    // Render project page if input title matches a project
    if (inputTitle == currProject.url) {
      // Redirect to archive if necessary
      if (currProject.archive) {
        res.redirect("/contact/" + currProject.url);
        return;
      }

      res.render("project", {
        projects,
        currProject,
        title: currProject.title + " // Jaclyn Chin",
        h1: currProject.title,
        url: currProject.url,
        description: currProject.description,
        text: currProject.text,
        bg: currProject.bg
      });
      return;
    }
  }

  // Otherwise, show 404
  res.render("404", {
    title: "Page Not Found // Jaclyn Chin",
    h1: "404 — Page Not Found"
  });
});

app.get("/contact/:project", function(req, res) {
  var inputTitle = req.params.project;

  // Check if valid project url
  var projectArray = projects.projects;

  for (var i = 0; i < projectArray.length; i++) {
    var currProject = projectArray[i];

    // Render project page if input title matches a project
    if (inputTitle == currProject.url) {
      // Redirect to index if necessary
      if (!currProject.archive) {
        res.redirect("/" + currProject.url);
        return;
      }

      res.render("project", {
        projects,
        currProject,
        title: currProject.title + " // Jaclyn Chin",
        h1: currProject.title,
        url: currProject.url,
        description: currProject.description,
        text: currProject.text,
        bg: currProject.bg
      });
      return;
    }
  }

  // Otherwise, show 404
  res.render("404", {
    title: "Page Not Found // Jaclyn Chin",
    h1: "404 — Page Not Found"
  });
});

var listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Express server started on port %s", listener.address().port);
});
