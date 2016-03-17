window.onload = main;
var DEBUG = false;

Array.prototype.foreach = function (fn) {
  for (var i = 0; i < this.length; i++) {
    fn(this[i]);
  }
}

function main() {
  var canvas = document.getElementById("canvas");
  var output = document.getElementById("output");
  var app = new App(canvas, output);
  var ts = performance.now();

  document.onkeydown = function (e) {
    switch (e.which) {
      case 37:
      case 38:
      case 39:
      case 40:
        e.preventDefault();
      default:
        app.keydown(e.which);
    }
  }

  document.onkeyup = function (e) {
    app.keyup(e.which);
  }

  function update(time) {
    var dt = time - ts;
    ts = time;
    app.update(dt/1000);
    window.requestAnimationFrame(update);
  }

  window.requestAnimationFrame(update);
}

function App(canvas, output) {

  this.playing = true;

  var ctx = canvas.getContext("2d");

  function initialize () {
    var entities = {
      robot: new Robot(new Vector(300, 300)),
      kitten: new Item('$', 'black', 'KITTEN!', new Vector(200, 20)),
      items: [
          new Item('@', 'orange', 'The Artifice educational center', new Vector(40, 40))
        , new Item('+', 'green', 'The smell of apple pie and flag pins', new Vector(300, 200))
      ]
    };
  
    return entities;
  };

  var entities = initialize();

  console.log(entities);
  var movingLeft = false;
  var movingRight = false;
  var movingDown = false;
  var movingUp = false;

  var velocity = new Vector(0, 0);

  this.update = function(dt) {
    if (this.playing) {
      ctx.clearRect(0, 0 , 720, 720);
      entities.robot.translate(velocity.mul(dt));
      
      if (entities.kitten.did_collide(entities.robot)) {
        entities.robot.translate(velocity.mul(-1 * dt));
        output.innerHTML = entities.kitten.desc;
        win();
      }
      
      entities.items.foreach(function (item) {
        if (item.did_collide(entities.robot)) {
          entities.robot.translate(velocity.mul(-1 * dt));
          console.log(item.desc);
          output.innerHTML = item.desc;
        }
      });
      
      entities.robot.render(ctx);
      entities.items.foreach(function (i) { i.render(ctx); });
      entities.kitten.render(ctx);
    }
  };

  var SPEED = 40;

  this.keydown = function (key) {
    if (DEBUG) { console.log(key); }
    switch (key) {
      case 112:
        this.playing = !this.playing;
        break;
      case 65:
      case 37:
        this.moveLeft();
        break;
      case 68:
      case 39:
        this.moveRight();
        break;
      case 87:
      case 38:
        this.moveUp();
        break;
      case 83:
      case 40:
        this.moveDown();
        break;
    }
  };

  this.keyup = function (key) {
    switch (key) {
      case 65:
      case 37:
        this.stopMoveLeft();
        break;
      case 68:
      case 39:
        this.stopMoveRight();
        break;
      case 87:
      case 38:
        this.stopMoveUp();
        break;
      case 83:
      case 40:
        this.stopMoveDown();
        break;
    }
  };

  this.moveLeft = function () {
    if (!movingLeft) {
      movingLeft = true;
      velocity.translate(new Vector(-1 * SPEED, 0));
    }
  }

  this.stopMoveLeft = function () {
    if (movingLeft) {
      movingLeft = false;
      velocity.translate(new Vector(SPEED, 0));
    }
  }

  this.moveRight = function () {
    if (!movingRight) {
      movingRight = true;
      velocity.translate(new Vector(SPEED, 0));
    }
  }

  this.stopMoveRight = function () {
    if (movingRight) {
      movingRight = false;
      velocity.translate(new Vector(-1 * SPEED, 0));
    }
  }

  this.moveDown = function () {
    if (!movingDown) {
      movingDown = true;
      velocity.translate(new Vector(0, SPEED));
    }
  }

  this.stopMoveDown = function () {
    if (movingDown) {
      movingDown = false;
      velocity.translate(new Vector(0, -1 * SPEED));
    }
  }

  this.moveUp = function () {
    if (!movingUp) {
      movingUp = true;
      velocity.translate(new Vector(0, -1 * SPEED));
    }
  }

  this.stopMoveUp = function () {
    if (movingUp) {
      movingUp = false;
      velocity.translate(new Vector(0, SPEED));
    }
  }

  function win () {

  }
}

function Vector(x, y) {
  this.x = x;
  this.y = y;

  this.translate = function (v) {
    this.x += v.x;
    this.y += v.y;
  }

  this.add = function (v) {
    return new Vector(this.x + v.x, this.y + v.y);
  }

  this.mul = function (z) {
    return new Vector(z * this.x, z * this.y);
  }
}

function Symbol(ch, color) {
  var m_canvas = document.createElement('canvas');
  m_canvas.width = 18;
  m_canvas.height = 20;

  var m_context = m_canvas.getContext('2d');
  m_context.font = "20px Anonymous Pro";
  if (color) {
    m_context.fillStyle = color;
  }
  m_context.textAlign = "left";
  m_context.textBaseline = "bottom";

  m_context.fillText(ch, 0, 20);

  this.render = function (ctx, pos) {
    ctx.drawImage(m_canvas, Math.floor(pos.x), Math.floor(pos.y));
  }

  this.height = m_canvas.height;
  this.width = Math.ceil(m_context.measureText(ch).width);

  if (DEBUG) {
    m_context.strokeRect(0, 0, this.width, this.height);
  }

}

function Robot(pos) {
  this.pos = pos;

  var sprite = new Symbol("#");

  this.render = function (ctx) {
    sprite.render(ctx, this.pos);
  };

  this.translate = function (v) {
    this.pos.translate(v);
  };

  this.bounding_box = function () {
    return [
        new Vector(this.pos.x, this.pos.y)
      , new Vector(this.pos.x + sprite.width, this.pos.y)
      , new Vector(this.pos.x, this.pos.y + sprite.height)
      , new Vector(this.pos.x + sprite.width, this.pos.y + sprite.height)
    ]
  };
}

function Item(ch, color, desc, pos) {
  this.pos = pos;
  this.desc = desc;

  var sprite = new Symbol(ch, color);

  this.render = function (ctx) { sprite.render(ctx, this.pos) };

  this.translate = function (v) {
    this.pos.translate(v);
  }
  
  this.did_collide = function (robot) {

    function check_corner(v) {
      if (v.x >= this.pos.x && 
          v.x <= (this.pos.x + sprite.width) && 
          v.y >= this.pos.y &&
          v.y <= (this.pos.y + sprite.height))
        return true;

      return false;
    }

    return robot.bounding_box().some(check_corner, this);
  }
}

