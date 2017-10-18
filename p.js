var EActionType;
(function (EActionType) {
    EActionType[EActionType["NEXT"] = 0] = "NEXT";
    EActionType[EActionType["BACK"] = 1] = "BACK";
    EActionType[EActionType["UNBACK"] = 2] = "UNBACK";
})(EActionType || (EActionType = {}));
var EColor;
(function (EColor) {
    EColor[EColor["BLACK"] = 0] = "BLACK";
    EColor[EColor["WHITE"] = 1] = "WHITE";
})(EColor || (EColor = {}));
var Action = /** @class */ (function () {
    function Action(p, c) {
        this.position = p;
        this.color = c;
    }
    return Action;
}());
// 游戏棋盘
var GameMap = /** @class */ (function () {
    function GameMap(col, row) {
        this.renderCallback = function () { };
        this.col = col;
        this.row = row;
        this._init();
    }
    GameMap.prototype._init = function () {
        this.reset();
    };
    GameMap.prototype.reset = function () {
        // 初始化棋盘
        var _list = [];
        for (var i = 0; i < this.col; i++) {
            _list[i] = [];
            for (var j = 0; j < this.row; j++) {
                _list[i][j] = null;
            }
        }
        this.mapList = _list;
    };
    // 设置棋局渲染执行函数
    GameMap.prototype.setRenderCallback = function (callback) {
        this.renderCallback = callback;
    };
    GameMap.prototype.update = function (action, type) {
        var check = false; // 是否需要检查规则
        switch (type) {
            case EActionType.UNBACK: {
                this.mapList[action.position.x][action.position.y] = action;
                break;
            }
            case EActionType.NEXT: {
                check = true;
                this.mapList[action.position.x][action.position.y] = action;
                break;
            }
            case EActionType.BACK: {
                this.mapList[action.position.x][action.position.y] = null;
                break;
            }
            default: {
                break;
            }
        }
        // 渲染棋局
        this.renderCallback(this.mapList, action, check);
    };
    return GameMap;
}());
// 游戏数据
var GameData = /** @class */ (function () {
    function GameData() {
        this.actionList = [];
        this.backList = [];
        this.absList = [];
        this.updateCallback = function () { };
    }
    // 设置动作更新回调函数
    GameData.prototype.setUpdateCallback = function (callback) {
        this.updateCallback = callback;
    };
    // 获取当前棋盘棋子分布数据
    GameData.prototype.getList = function () {
        return this.actionList;
    };
    GameData.prototype.reset = function () {
        this.actionList = [];
        this.backList = [];
        this.absList = [];
        this.updateCallback();
    };
    // 下一步
    GameData.prototype.next = function (action) {
        var x = action.position.x, y = action.position.y;
        if (!this.absList[x] || !this.absList[x][y]) {
            this.actionList.push(action);
            this.updateCallback(action, EActionType.NEXT);
            if (!this.absList[x]) {
                this.absList[x] = [];
            }
            this.absList[x][y] = true;
        }
    };
    // 悔棋
    GameData.prototype.back = function () {
        var preAction = this.actionList.pop();
        if (preAction) {
            this.backList.push(preAction);
            this.updateCallback(preAction, EActionType.BACK);
            this.absList[preAction.position.x][preAction.position.y] = false;
        }
    };
    // 撤销悔棋
    GameData.prototype.unBack = function () {
        var preback = this.backList.pop();
        if (preback) {
            this.actionList.push(preback);
            this.updateCallback(preback, EActionType.UNBACK);
            this.absList[preback.position.x][preback.position.y] = true;
        }
    };
    GameData.ACTIONTYPE = {
        NEXT: 'next',
        BACK: 'back',
        UNBACK: 'unback'
    };
    return GameData;
}());
// 游戏规则玩法
var GamePlay = /** @class */ (function () {
    function GamePlay() {
    }
    GamePlay.prototype.checkWin = function (list, action) {
        var book = [0, 0, 0, 0, 0, 0, 0, 0];
        var pos = [
            [-1, -1],
            [0, -1],
            [1, -1],
            [-1, 0],
            [1, 0],
            [-1, 1],
            [0, 1],
            [1, 1]
        ];
        (function _check(p, x, y, c) {
            // 检测8个方向 的 临近棋子 是否有相同颜色
            var positionArr = pos.map(function (item, index) {
                return [x + item[0], y + item[1], index];
            });
            // 筛选方向
            if (p !== -1) {
                positionArr = [positionArr[p]];
            }
            // 过滤无效坐标
            var aList = positionArr.filter(function (posArr) {
                return posArr[0] < list.length &&
                    posArr[0] >= 0 &&
                    posArr[1] < list[posArr[0]].length &&
                    posArr[1] >= 0;
            }).map(function (posArr) {
                return { a: list[posArr[0]][posArr[1]], p: posArr[2] };
            });
            // 遍历
            for (var i = 0, l = aList.length; i < l; i++) {
                var tempA = aList[i].a;
                if (tempA !== null && tempA.color === action.color) {
                    // 记录点数
                    book[aList[i].p] += 1;
                    _check(aList[i].p, tempA.position.x, tempA.position.y, tempA.color);
                }
            }
            return;
        }(-1, action.position.x, action.position.y, action.color));
        console.log(book);
        // 判断同一直线个数 （不包括本身棋子）
        for (var i = 0; i < 4; i++) {
            var sum = book[i] + book[7 - i];
            if (sum >= 4) {
                // 有5个再同一行，胜出
                return true;
            }
        }
        // 未达到胜利条件
        return false;
    };
    return GamePlay;
}());
