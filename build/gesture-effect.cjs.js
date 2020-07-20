'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var React = require('react');
var React__default = _interopDefault(React);

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

function __spreadArrays() {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
}

/* tslint:disable:no-bitwise */
// http://hammerjs.github.io/api/#directions
var DIRECTION_NONE = 1; // 00001

var DIRECTION_LEFT = 2; // 00010

var DIRECTION_RIGHT = 4; // 00100

var DIRECTION_UP = 8; // 01000

var DIRECTION_DOWN = 16; // 10000

var DIRECTION_HORIZONTAL = DIRECTION_LEFT | DIRECTION_RIGHT; // 00110 6

var DIRECTION_VERTICAL = DIRECTION_UP | DIRECTION_DOWN; // 11000 24

var DIRECTION_ALL = DIRECTION_HORIZONTAL | DIRECTION_VERTICAL; // 11110  30
// http://hammerjs.github.io/recognizer-press/

var PRESS = {
  time: 251
}; // http://hammerjs.github.io/recognizer-swipe/

var SWIPE = {
  threshold: 10,
  velocity: 0.3
};

/* tslint:disable:no-bitwise */

function _calcTriangleDistance(x, y) {
  return Math.sqrt(x * x + y * y);
}

function _calcAngle(x, y) {
  var radian = Math.atan2(y, x);
  return 180 / (Math.PI / radian);
}

function now() {
  return Date.now();
}
function calcMutliFingerStatus(touches) {
  if (touches.length < 2) {
    return;
  }

  var _a = touches[0],
      x1 = _a.x,
      y1 = _a.y;
  var _b = touches[1],
      x2 = _b.x,
      y2 = _b.y;
  var deltaX = x2 - x1;
  var deltaY = y2 - y1;
  return {
    x: deltaX,
    y: deltaY,
    z: _calcTriangleDistance(deltaX, deltaY),
    angle: _calcAngle(deltaX, deltaY)
  };
}
function calcMoveStatus(startTouches, touches, time) {
  var _a = startTouches[0],
      x1 = _a.x,
      y1 = _a.y;
  var _b = touches[0],
      x2 = _b.x,
      y2 = _b.y;
  var deltaX = x2 - x1;
  var deltaY = y2 - y1;

  var deltaZ = _calcTriangleDistance(deltaX, deltaY);

  return {
    x: deltaX,
    y: deltaY,
    z: deltaZ,
    time: time,
    velocity: deltaZ / time,
    angle: _calcAngle(deltaX, deltaY)
  };
}
function calcRotation(startMutliFingerStatus, mutliFingerStatus) {
  var startAngle = startMutliFingerStatus.angle;
  var angle = mutliFingerStatus.angle;
  return angle - startAngle;
}
function getEventName(prefix, status) {
  return prefix + status[0].toUpperCase() + status.slice(1);
}
function shouldTriggerSwipe(delta, velocity) {
  return Math.abs(delta) >= SWIPE.threshold && Math.abs(velocity) > SWIPE.velocity;
}
function shouldTriggerDirection(direction, directionSetting) {
  if (directionSetting & direction) {
    return true;
  }

  return false;
}
/**
 * @private
 * get the direction between tow points when touch moving
 * Note: will change next version
 * @param {Object} point1 coordinate point, include x & y attributes
 * @param {Object} point2 coordinate point, include x & y attributes
 * @return {Number} direction
 */

function getMovingDirection(point1, point2) {
  var x1 = point1.x,
      y1 = point1.y;
  var x2 = point2.x,
      y2 = point2.y;
  var deltaX = x2 - x1;
  var deltaY = y2 - y1;

  if (deltaX === 0 && deltaY === 0) {
    return DIRECTION_NONE;
  }

  if (Math.abs(deltaX) >= Math.abs(deltaY)) {
    return deltaX < 0 ? DIRECTION_LEFT : DIRECTION_RIGHT;
  }

  return deltaY < 0 ? DIRECTION_UP : DIRECTION_DOWN;
}
function getDirectionEventName(direction) {
  var name;

  switch (direction) {
    case DIRECTION_NONE:
      break;

    case DIRECTION_LEFT:
      name = "left";
      break;

    case DIRECTION_RIGHT:
      name = "right";
      break;

    case DIRECTION_UP:
      name = "up";
      break;

    case DIRECTION_DOWN:
      name = "down";
      break;
  }

  return name;
}

var directionMap = {
  all: DIRECTION_ALL,
  vertical: DIRECTION_VERTICAL,
  horizontal: DIRECTION_HORIZONTAL
};

var Gesture =
/** @class */
function (_super) {
  __extends(Gesture, _super);

  function Gesture(props) {
    var _this = _super.call(this, props) || this;

    _this.state = {};

    _this.triggerEvent = function (name) {
      var args = [];

      for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
      }

      var cb = _this.props[name];

      if (typeof cb === "function") {
        // always give user gesture object as first params first
        cb.apply(void 0, __spreadArrays([_this.getGestureState()], args));
      }
    };

    _this.triggerCombineEvent = function (mainEventName, eventStatus) {
      var args = [];

      for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
      }

      _this.triggerEvent.apply(_this, __spreadArrays([mainEventName], args));

      _this.triggerSubEvent.apply(_this, __spreadArrays([mainEventName, eventStatus], args));
    };

    _this.triggerSubEvent = function (mainEventName, eventStatus) {
      var args = [];

      for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
      }

      if (eventStatus) {
        var subEventName = getEventName(mainEventName, eventStatus);

        _this.triggerEvent.apply(_this, __spreadArrays([subEventName], args));
      }
    };

    _this.triggerPinchEvent = function (mainEventName, eventStatus) {
      var args = [];

      for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
      }

      var scale = _this.gesture.scale;

      if (eventStatus === "move" && typeof scale === "number") {
        if (scale > 1) {
          _this.triggerEvent("onPinchOut");
        }

        if (scale < 1) {
          _this.triggerEvent("onPinchIn");
        }
      }

      _this.triggerCombineEvent.apply(_this, __spreadArrays([mainEventName, eventStatus], args));
    };

    _this.initPressTimer = function () {
      _this.cleanPressTimer();

      _this.pressTimer = setTimeout(function () {
        _this.setGestureState({
          press: true
        });

        _this.triggerEvent("onPress");
      }, PRESS.time);
    };

    _this.cleanPressTimer = function () {
      /* tslint:disable:no-unused-expression */
      _this.pressTimer && clearTimeout(_this.pressTimer);
    };

    _this.setGestureState = function (params) {
      if (!_this.gesture) {
        _this.gesture = {};
      } // cache the previous touches


      if (_this.gesture.touches) {
        _this.gesture.preTouches = _this.gesture.touches;
      }

      _this.gesture = __assign(__assign({}, _this.gesture), params);
    };

    _this.getGestureState = function () {
      if (!_this.gesture) {
        return _this.gesture;
      } else {
        // shallow copy
        return __assign({}, _this.gesture);
      }
    };

    _this.cleanGestureState = function () {
      delete _this.gesture;
    };

    _this.getTouches = function (e) {
      return Array.prototype.slice.call(e.touches).map(function (item) {
        return {
          x: item.screenX,
          y: item.screenY
        };
      });
    };

    _this.triggerUserCb = function (status, e) {
      var cbName = getEventName("onTouch", status);

      if (cbName in _this.props) {
        _this.props[cbName](e);
      }
    };

    _this._handleTouchStart = function (e) {
      _this.triggerUserCb("start", e);

      _this.event = e;

      if (e.touches.length > 1) {
        e.preventDefault();
      }

      _this.initGestureStatus(e);

      _this.initPressTimer();

      _this.checkIfMultiTouchStart();
    };

    _this.initGestureStatus = function (e) {
      _this.cleanGestureState(); // store the gesture start state


      var startTouches = _this.getTouches(e);

      var startTime = now();
      var startMutliFingerStatus = calcMutliFingerStatus(startTouches);

      _this.setGestureState({
        startTime: startTime,
        startTouches: startTouches,
        startMutliFingerStatus: startMutliFingerStatus,

        /* copy for next time touch move cala convenient*/
        time: startTime,
        touches: startTouches,
        mutliFingerStatus: startMutliFingerStatus,
        srcEvent: _this.event
      });
    };

    _this.checkIfMultiTouchStart = function () {
      var _a = _this.props,
          enablePinch = _a.enablePinch,
          enableRotate = _a.enableRotate;
      var touches = _this.gesture.touches;

      if (touches.length > 1 && (enablePinch || enableRotate)) {
        if (enablePinch) {
          var startMutliFingerStatus = calcMutliFingerStatus(touches);

          _this.setGestureState({
            startMutliFingerStatus: startMutliFingerStatus,

            /* init pinch status */
            pinch: true,
            scale: 1
          });

          _this.triggerCombineEvent("onPinch", "start");
        }

        if (enableRotate) {
          _this.setGestureState({
            /* init rotate status */
            rotate: true,
            rotation: 0
          });

          _this.triggerCombineEvent("onRotate", "start");
        }
      }
    };

    _this._handleTouchMove = function (e) {
      _this.triggerUserCb("move", e);

      _this.event = e;

      if (!_this.gesture) {
        // sometimes weird happen: touchstart -> touchmove..touchmove.. --> touchend --> touchmove --> touchend
        // so we need to skip the unnormal event cycle after touchend
        return;
      } // not a long press


      _this.cleanPressTimer();

      _this.updateGestureStatus(e);

      _this.checkIfSingleTouchMove();

      _this.checkIfMultiTouchMove();
    };

    _this.checkIfMultiTouchMove = function () {
      var _a = _this.gesture,
          pinch = _a.pinch,
          rotate = _a.rotate,
          touches = _a.touches,
          startMutliFingerStatus = _a.startMutliFingerStatus,
          mutliFingerStatus = _a.mutliFingerStatus;

      if (!pinch && !rotate) {
        return;
      }

      if (touches.length < 2) {
        _this.setGestureState({
          pinch: false,
          rotate: false
        }); // Todo: 2 finger -> 1 finger, wait to test this situation


        pinch && _this.triggerCombineEvent("onPinch", "cancel");
        rotate && _this.triggerCombineEvent("onRotate", "cancel");
        return;
      }

      if (pinch) {
        var scale = mutliFingerStatus.z / startMutliFingerStatus.z;

        _this.setGestureState({
          scale: scale
        });

        _this.triggerPinchEvent("onPinch", "move");
      }

      if (rotate) {
        var rotation = calcRotation(startMutliFingerStatus, mutliFingerStatus);

        _this.setGestureState({
          rotation: rotation
        });

        _this.triggerCombineEvent("onRotate", "move");
      }
    };

    _this.allowGesture = function () {
      return shouldTriggerDirection(_this.gesture.direction, _this.directionSetting);
    };

    _this.checkIfSingleTouchMove = function () {
      var _a = _this.gesture,
          pan = _a.pan,
          touches = _a.touches,
          moveStatus = _a.moveStatus,
          preTouches = _a.preTouches,
          _b = _a.availablePan,
          availablePan = _b === void 0 ? true : _b;

      if (touches.length > 1) {
        _this.setGestureState({
          pan: false
        }); // Todo: 1 finger -> 2 finger, wait to test this situation


        pan && _this.triggerCombineEvent("onPan", "cancel");
        return;
      } // add avilablePan condition to fix the case in scrolling, which will cause unavailable pan move.


      if (moveStatus && availablePan) {
        var direction = getMovingDirection(preTouches[0], touches[0]);

        _this.setGestureState({
          direction: direction
        });

        var eventName = getDirectionEventName(direction);

        if (!_this.allowGesture()) {
          // if the first move is unavailable, then judge all of remaining touch movings are also invalid.
          if (!pan) {
            _this.setGestureState({
              availablePan: false
            });
          }

          return;
        }

        if (!pan) {
          _this.triggerCombineEvent("onPan", "start");

          _this.setGestureState({
            pan: true,
            availablePan: true
          });
        } else {
          _this.triggerCombineEvent("onPan", eventName);

          _this.triggerSubEvent("onPan", "move");
        }
      }
    };

    _this.checkIfMultiTouchEnd = function (status) {
      var _a = _this.gesture,
          pinch = _a.pinch,
          rotate = _a.rotate;

      if (pinch) {
        _this.triggerCombineEvent("onPinch", status);
      }

      if (rotate) {
        _this.triggerCombineEvent("onRotate", status);
      }
    };

    _this.updateGestureStatus = function (e) {
      var time = now();

      _this.setGestureState({
        time: time
      });

      if (!e.touches || !e.touches.length) {
        return;
      }

      var _a = _this.gesture,
          startTime = _a.startTime,
          startTouches = _a.startTouches,
          pinch = _a.pinch,
          rotate = _a.rotate;

      var touches = _this.getTouches(e);

      var moveStatus = calcMoveStatus(startTouches, touches, time - startTime);
      var mutliFingerStatus;

      if (pinch || rotate) {
        mutliFingerStatus = calcMutliFingerStatus(touches);
      }

      _this.setGestureState({
        /* update status snapshot */
        touches: touches,
        mutliFingerStatus: mutliFingerStatus,

        /* update duration status */
        moveStatus: moveStatus
      });
    };

    _this._handleTouchEnd = function (e) {
      _this.triggerUserCb("end", e);

      _this.event = e;

      if (!_this.gesture) {
        return;
      }

      _this.cleanPressTimer();

      _this.updateGestureStatus(e);

      _this.doSingleTouchEnd("end");

      _this.checkIfMultiTouchEnd("end");
    };

    _this._handleTouchCancel = function (e) {
      _this.triggerUserCb("cancel", e);

      _this.event = e; // Todo: wait to test cancel case

      if (!_this.gesture) {
        return;
      }

      _this.cleanPressTimer();

      _this.updateGestureStatus(e);

      _this.doSingleTouchEnd("cancel");

      _this.checkIfMultiTouchEnd("cancel");
    };

    _this.triggerAllowEvent = function (type, status) {
      if (_this.allowGesture()) {
        _this.triggerCombineEvent(type, status);
      } else {
        _this.triggerSubEvent(type, status);
      }
    };

    _this.doSingleTouchEnd = function (status) {
      var _a = _this.gesture,
          moveStatus = _a.moveStatus,
          pinch = _a.pinch,
          rotate = _a.rotate,
          press = _a.press,
          pan = _a.pan,
          direction = _a.direction;

      if (pinch || rotate) {
        return;
      }

      if (moveStatus) {
        var z = moveStatus.z,
            velocity = moveStatus.velocity;
        var swipe = shouldTriggerSwipe(z, velocity);

        _this.setGestureState({
          swipe: swipe
        });

        if (pan) {
          // pan need end, it's a process
          // sometimes, start with pan left, but end with pan right....
          _this.triggerAllowEvent("onPan", status);
        }

        if (swipe) {
          var directionEvName = getDirectionEventName(direction); // swipe just need a direction, it's a endpoint

          _this.triggerAllowEvent("onSwipe", directionEvName);

          return;
        }
      }

      if (press) {
        _this.triggerEvent("onPressUp");

        return;
      }

      _this.triggerEvent("onTap");
    };

    _this.getTouchAction = function () {
      var _a = _this.props,
          enablePinch = _a.enablePinch,
          enableRotate = _a.enableRotate;
      var directionSetting = _this.directionSetting;

      if (enablePinch || enableRotate || directionSetting === DIRECTION_ALL) {
        return "pan-x pan-y";
      }

      if (directionSetting === DIRECTION_VERTICAL) {
        return "pan-x";
      }

      if (directionSetting === DIRECTION_HORIZONTAL) {
        return "pan-y";
      }

      return "auto";
    };

    _this.directionSetting = directionMap[props.direction];
    return _this;
  }

  Gesture.prototype.componentWillUnmount = function () {
    this.cleanPressTimer();
  };

  Gesture.prototype.render = function () {
    var children = this.props.children;
    var child = React__default.Children.only(children);
    var touchAction = this.getTouchAction();
    var events = {
      onTouchStart: this._handleTouchStart,
      onTouchMove: this._handleTouchMove,
      onTouchCancel: this._handleTouchCancel,
      onTouchEnd: this._handleTouchEnd
    };
    return React__default.cloneElement(child, __assign(__assign({}, events), {
      style: __assign({
        touchAction: touchAction
      }, child.props.style || {})
    }));
  };

  Gesture.defaultProps = {
    enableRotate: false,
    enablePinch: false,
    direction: "all"
  };
  return Gesture;
}(React.Component);

module.exports = Gesture;
