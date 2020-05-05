var Sequelize = require('sequelize');
var bcrypt = require('bcrypt');

var sequelize;
if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect:'postgres',
    protocol:'postgres'
  });
} else {
  sequelize = new Sequelize('igru', 'postgres', 'fish', {
    dialect:'postgres',
    protocol:'postgres'
  });
}

var User = sequelize.define('user', {
  username: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false
  },
  email: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false
  },
  first_name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  last_name: {
    type: Sequelize.STRING
  },
  saved_events: {
    type: Sequelize.ARRAY(Sequelize.INTEGER)
  },
  admin: {
    type: Sequelize.BOOLEAN
  }
}, {
  hooks: {
    beforeCreate: (user) => {
      const salt = bcrypt.genSaltSync();
      user.password = bcrypt.hashSync(user.password, salt);
    }
  }
});

User.prototype.validPassword = function(password) {
  return bcrypt.compareSync(password, this.password);
}
User.addEvent = async function(u_id, event_id) {
  var t_user = await User.findByPk(u_id);
  if (t_user) {
    var s_events = t_user.dataValues.saved_events || []; 
    if (!s_events.includes(event_id)) {
      s_events.push(event_id);
      await User.update({saved_events: s_events}, {where: {id: u_id}});
    }
  }
}
User.removeEvent = async function(u_id, event_id) {
  var t_user = await User.findByPk(u_id);
  if (t_user) {
    var s_events = t_user.dataValues.saved_events || []; 
    console.log(s_events);
    console.log(event_id);
    console.log(s_events.includes(event_id));
    if (s_events.includes(event_id)) {
      const index = s_events.indexOf(event_id);
      if (index > -1) {
        s_events.splice(index, 1);
      }
      await User.update({saved_events: s_events}, {where: {id: u_id}});
    }
  }
}

sequelize.sync()
  .then(() => console.log('Users table has been successfully created, if it doesn\'t exist'))
  .catch(error => console.log('Error: ', error));

module.exports = User;
