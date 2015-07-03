Template.workinprogress.helpers({
  wips: function () {
    return Taskspending.find({tags: "mit"}, {sort: {rank: 1}})
  },
  somedaymaybeproject: function () {
    if (this.project && Taskspending.findOne({tags: "somedaymaybeproj", project: this.project})) {
      return true
    }
  },
  somedaymaybecontext: function () {
    if (this.context && Taskspending.findOne({tags: "somedaymaybecont", context: this.context})) {
      return true
    }
  },
  sorting_wips: function () {
    if (Session.equals('sorting_wips', true)) {
      return 'btn-primary'
    } else {
      return ''
    }
  },
})

// begin modular subscription loading

Template.workinprogress.created = function () {

  // 1. Initialization

  var instance = this;

  // initialize the reactive variables
  instance.loaded = new ReactiveVar(0);
  instance.wipslimit = new ReactiveVar(5);

  // 2. Autorun

  // will re-run when the "limit" reactive variables changes
  this.autorun(function () {

    // get the limit
    var wipslimit = instance.wipslimit.get();

    // console.log("Asking for "+wipslimit+" WIPs…")

    // subscribe to the posts publication
    var subscription = instance.subscribe('taskspendingwips', wipslimit)

    // if subscription is ready, set limit to newLimit
    if (subscription.ready()) {
      // console.log("> Received "+wipslimit+" WIPs. \n\n")
      instance.loaded.set(wipslimit);
    } else {
      // console.log("> Subscription is not ready yet. \n\n");
    }
  });

  // 3. Cursor

  instance.taskspendingwips = function() {
    return Taskspending.find({tags: "mit"}, {sort: {rank: 1}})
  }

};

Template.workinprogress.helpers({
  // the posts cursor
  wips: function () {
    return Template.instance().taskspendingwips();
  },
  // are there more posts to show?
  hasMorePosts: function () {
    return Template.instance().taskspendingwips().count() >= Template.instance().wipslimit.get();
  }
});

Template.workinprogress.events({
  'click .load-more-wips': function (event, instance) {
    event.preventDefault();

    // get current value for limit, i.e. how many posts are currently displayed
    var wipslimit = instance.wipslimit.get();

    // increase limit by 5 and update it
    wipslimit += 5;
    instance.wipslimit.set(wipslimit)
  },
  'click .closewipssection': function(e,t){
    Session.set('wipshidden', true)
  },
});

// end modular subscription loading

