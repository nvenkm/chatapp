const users = [];
//join user to chat
function userJoin(id, username, room) {
  const user = {
    id,
    username,
    room,
  };
  users.push(user);
  return user;
}

//get current user
function getCurrentUser(id) {
  for (let user of users) {
    if (user.id === id) {
      return user;
    }
  }

  // return users.find((user) => user.id === id);
}

//user leaves
function userLeave(id) {
  const index = users.findIndex((user) => user.id == id);
  // console.log(index);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
}

//get room users
function getRoomUsers(room) {
  return users.filter((user) => user.room === room);
}

//search user by name
function getUserByName(name) {
  for (let user of users) {
    if (user.username === name) {
      return user;
    }
  }
}

module.exports = {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
  getUserByName,
};
