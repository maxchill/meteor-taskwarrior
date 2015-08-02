Template.multitaskstwo.helpers({
  multitasks20: function () {
    return Taskspending.find({status: {$in: ["waiting", "pending"]}, $and: [{tags: {$not: "inbox"}}, {project: {$exists: true}}, {context: this.toString()}]}, {sort: {tags: {$in: ["kickstart", "mit"]}, rank: {$exists: true}, rank: 1}})
  },
  projectcolor: function () {
    return "projectcolor"
  },
  mitornot: function () {
    if (Taskspending.findOne({_id: this._id, tags: "mit"})) {
      return 'active'
    }
    else {
      return ''
    }
  },
  editing: function () {
    return Session.equals('editing_itemname', this._id);
  },
})

// begin modular subscription loading

Template.multitaskstwo.created = function () {

  // 1. Initialization
  var context = this.data
  var instance = this;

  // initialize the reactive variables
  instance.loaded = new ReactiveVar(0);
  instance.multitasks2limit = new ReactiveVar(5);

  // 2. Autorun

  // will re-run when the "limit" reactive variables changes
  this.autorun(function () {

    // get the limit
    var multitasks2limit = instance.multitasks2limit.get();

    console.log("Asking for "+multitasks2limit+" posts…")

    // subscribe to the posts publication
    var aorfocus = Taskspending.find({tags: "aorfocus"}).map(function (doc) {
      return doc._id
    })
console.log(aorfocus)
    if (!aorfocus) {
      var subscription = instance.subscribe('taskspendingmultitasks2', context, [])
    }
    else {
      var aorprojects = Taskspending.find({_id: {$in: aorfocus}}).map(function (doc) {
        return Taskspending.find({tags: "largeroutcome", aor: doc._id}).map(function (doc) {
          return '"' +  doc.project + '"'
        })
      })
var aorprojects = '[' + aorprojects + ']'
console.log("aorprojects is " + aorprojects)
      var subscription = instance.subscribe('taskspendingmultitasks2', context, aorprojects)
    }
    // if subscription is ready, set limit to newLimit
    if (subscription.ready()) {
      console.log("> Received "+multitasks2limit+" posts. \n\n")
      instance.loaded.set(multitasks2limit);
      var thisprojlist = Taskspending.find({context: context, project: {$exists: 1}}).map( function (doc) {
        return doc.project
      })
      var contextaorlist = Taskspending.find({project: {$in: thisprojlist}, aor: {$exists: 1}}).map( function (doc) {
          return doc.aor
      })
console.log(contextaorlist)
var uniquecontextaorlist = [];
$.each(contextaorlist, function(i, el){
    if($.inArray(el, uniquecontextaorlist) === -1) uniquecontextaorlist.push(el);
});
      for (i in uniquecontextaorlist) {
console.log(uniquecontextaorlist[i])
        console.log(Taskspending.findOne({_id: uniquecontextaorlist[i]}).description)
      }
      console.log("context is " + context)
      var contextid = Taskspending.findOne({context: context, tags: "largercontext"})._id
      Taskspending.update({_id: contextid}, {$set: {contextaor: uniquecontextaorlist}})
    } else {
      console.log("> Subscription is not ready yet. \n\n");
    }
  });

  // 3. Cursor

  instance.taskspendingmultitasks2 = function() {
    var aorfocus = Taskspending.find({tags: "aorfocus"}).map(function (doc) {
      return doc._id
    })
    if (!aorfocus || aorfocus == []) {
console.log("there's no aorfocus")
      return Taskspending.find({status: {$in: ["waiting", "pending"]}, $and: [{tags: {$not: "inbox"}}, {project: {$exists: true}}, {context: context}]}, {sort: {tags: {$in: ["kickstart", "mit"]}, rank: {$exists: true}, rank: 1}, limit: instance.loaded.get()})
    }
    else {
console.log("ohairthisexists")
      var aorprojects = new Array()
      Taskspending.find({_id: {$in: aorfocus}}).forEach(function (doc) {
        Taskspending.find({tags: "largeroutcome", aor: doc._id}).forEach(function (doc) {
          aorprojects.push(doc.project)
        })
      })
      console.log("o yea yea yea " + aorprojects)
      return Taskspending.find({status: {$in: ["waiting", "pending"]}, $and: [{tags: {$not: "inbox"}}, {project: {$in: aorprojects}}, {context: context}]}, {sort: {tags: {$in: ["kickstart", "mit"]}, rank: {$exists: true}, rank: 1}, limit: instance.loaded.get()})
    }
  }

};

Template.multitaskstwo.helpers({
  // the posts cursor
  multitasks2: function () {
    return Template.instance().taskspendingmultitasks2();
  },
  // are there more posts to show?
  hasMorePosts: function () {
    return Template.instance().taskspendingmultitasks2().count() >= Template.instance().multitasks2limit.get();
  }
});

Template.multitaskstwo.events({
  'click .load-more-projectedcontext': function (event, instance) {
    event.preventDefault();

    // get current value for limit, i.e. how many posts are currently displayed
    var multitasks2limit = instance.multitasks2limit.get();

    // increase limit by 5 and update it
    multitasks2limit += 5;
    instance.multitasks2limit.set(multitasks2limit)
  },
  'dblclick .todo-item': function (e, t) {
    Session.set('editing_itemname', this._id);
    Meteor.flush(); // update DOM before focus
    focus_field_by_id("todo-input");
  },
  'focusout #todo-input': function (e, t) {
    Session.set('editing_itemname', null);
    Meteor.flush();
  },
  'keyup #todo-input': function (e,t) {
    if (e.which === 13)
    {
      var taskVal = String(e.target.value || "");
      if (taskVal)
      {
        var formattednow = formattedNow()
        var uuid = this.uuid
console.log(uuid)
        console.log(Tasksbacklog.insert({description: taskVal, entry: formattednow, uuid:uuid}))
        console.log(Taskspending.update({_id:this._id},{$set:{description: taskVal, entry: formattednow}}))
        Session.set('editing_itemname', null);
       }
     }
  },
});

// end modular subscription loading



