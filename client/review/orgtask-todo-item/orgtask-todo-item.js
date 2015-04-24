Session.set('editing_itemname', null);

Template.orgtask_todo_item.editing = function () {
  return Session.equals('editing_itemname', this._id);
};

Template.orgtask_todo_item.events({
  'dblclick .todo-item': function (e, t) {
//    alert('Hi');
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

// Finds a text input in the DOM by id and focuses it.
var focus_field_by_id = function (id) {
  var input = document.getElementById(id);
  if (input) {
    input.focus();
    input.select();
  }
};

Template.orgtask_todo_item.is_kickstarter = function () {
  var truefalse = null
  if (Taskspending.findOne({project: this.project, tags: "kickstart"})) {
  truefalse = (this._id == Taskspending.findOne({project: this.project, tags: "kickstart"})._id)
  }
  return truefalse
}

Template.orgtask_todo_item.nokickstart = function () {
  if (this.project) {
  return !Taskspending.findOne({project: this.project, tags:"kickstart"});
  } else {
  return false
  }
};

