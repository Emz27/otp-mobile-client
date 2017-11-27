var LegView = Backbone.View.extend({
  legVehicleTpl: _.template($('#leg_vehicle').html()),
  legWalkTpl: _.template($('#leg_walk').html()),

  // events: {
  //   'dblclick label': 'edit',
  //   'keypress .edit': 'updateOnEnter',
  //   'blur .edit':   'close'
  // },

  initialize: function (options) {
    this.options = options || {};

    if ('WALK' == this.model.get('conveyance')) {
      this.el.html(this.legWalkTpl());
    } else {
      this.el.html(this.legVehicleTpl());
    }
  },

  remove: function(){
    // Your processing code here

    Backbone.View.prototype.remove.apply(this, arguments);
  }
});

var IteneraryView = Backbone.View.extend({

  iteneraryTemplate: _.template($('#leg-tab').html()),

  initialize: function (options) {

    this.options = options || {};

    this.$tab = this.$("tab");
    this.$tab_content = this.$("tab_content");

    this.listenTo(itenerary0, 'add', method);


  },

  // Re-render the title of the todo item.
  render: function() {
    this.$el.html( this.todoTpl( this.model.attributes ) );

    return this;
  },
  addLeg: function(leg){

    var view = new LegView({model : })

  }
});

var AppView = Backbone.View.extend({

  el: $("right-sidebar"),

  initialize: function (options) {

    this.options = options || {};

    this.$tab = this.$("tab");
    this.$tab_content = this.$("tab_content");

    this.listenTo(itenerary0, 'add', method);


  },

  // Re-render the title of the todo item.
  render: function() {
    this.$el.html( this.todoTpl( this.model.attributes ) );

    return this;
  },
  addItenerary: function(leg){


  }
});
