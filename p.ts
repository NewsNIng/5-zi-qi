
interface IPosition {
    x: number,
    y: number
}

enum EActionType {
    NEXT,
    BACK,
    UNBACK
}


enum EColor {
    BLACK,
    WHITE
}


class Action {
    public position: IPosition;
    public color: EColor;

    constructor(p: IPosition, c: EColor) {
        this.position = p;
        this.color = c;
    }
}


// 游戏棋盘
class GameMap {
    private mapList: Action[][];
    private col: number;
    private row: number;

    private renderCallback: Function = () => { };

    constructor(col: number, row: number) {
        this.col = col;
        this.row = row;
        this._init();
    }

    private _init(): void {
        this.reset();
    }

    public reset(): void {
        // 初始化棋盘
        let _list: Action[][] = [];
        for (let i = 0; i < this.col; i++) {
            _list[i] = [];
            for (let j = 0; j < this.row; j++) {
                _list[i][j] = null;
            }
        }
        this.mapList = _list;
    }

    // 设置棋局渲染执行函数
    public setRenderCallback(callback: Function): void {
        this.renderCallback = callback;
    }



    update(action: Action, type: EActionType) {
        let check = false; // 是否需要检查规则
        switch (type) {
            case EActionType.UNBACK: {// 撤销悔棋
                this.mapList[action.position.x][action.position.y] = action;
                break;
            }
            case EActionType.NEXT: { // 新的棋子下落
                check = true;
                this.mapList[action.position.x][action.position.y] = action;
                break;
            }
            case EActionType.BACK: { // 悔棋
                this.mapList[action.position.x][action.position.y] = null;
                break;
            }
            default: {
                break;
            }
        }
        // 渲染棋局
        this.renderCallback(this.mapList, action, check);
    }
}



// 游戏数据
class GameData {
    public static ACTIONTYPE: Object = {
        NEXT: 'next',
        BACK: 'back',
        UNBACK: 'unback'
    };

    private actionList: Action[] = [];
    private backList: Action[] = [];
    private absList: boolean[][] = [];

    private updateCallback: Function = () => { };

    // 设置动作更新回调函数
    public setUpdateCallback(callback: Function): void {
        this.updateCallback = callback;
    }

    // 获取当前棋盘棋子分布数据
    public getList(): Action[] {
        return this.actionList;
    }

    public reset(): void {
        this.actionList = [];
        this.backList = [];
        this.absList = [];
        this.updateCallback();
    }

    // 下一步
    public next(action: Action): void {
        let x = action.position.x, y = action.position.y;
        if (!this.absList[x] || !this.absList[x][y]) {
            this.actionList.push(action);
            this.updateCallback(action, EActionType.NEXT);
            if (!this.absList[x]) {
                this.absList[x] = [];
            }
            this.absList[x][y] = true;
        }

    }

    // 悔棋
    public back(): void {
        let preAction: Action = this.actionList.pop();
        if (preAction) {
            this.backList.push(preAction);
            this.updateCallback(preAction, EActionType.BACK);
            this.absList[preAction.position.x][preAction.position.y] = false;
        }
    }

    // 撤销悔棋
    public unBack(): void {
        let preback: Action = this.backList.pop();
        if (preback) {
            this.actionList.push(preback);
            this.updateCallback(preback, EActionType.UNBACK);
            this.absList[preback.position.x][preback.position.y] = true;
        }
    }


}

// 游戏规则玩法
class GamePlay {


    public checkWin(list: Action[][], action: Action): boolean {
        let book = [0,0,0,0,0,0,0,0];
        let pos = [
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
            let positionArr = pos.map(function (item, index) {
                return [x + item[0], y + item[1], index];
            });
            // 筛选方向
            if (p !== -1) {
                positionArr = [positionArr[p]];
            }
            // 过滤无效坐标
            let aList = positionArr.filter(function (posArr) {
                return posArr[0] < list.length &&
                    posArr[0] >= 0 &&
                    posArr[1] < list[posArr[0]].length &&
                    posArr[1] >= 0;
            }).map(function (posArr) {
                return { a: list[posArr[0]][posArr[1]], p: posArr[2] };
            });
            // 遍历
            for (let i = 0, l = aList.length; i < l; i++) {
                let tempA = aList[i].a;
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
        for(let i = 0; i < 4; i++){
            let sum = book[i] + book[7 - i];
            if(sum >= 4){
                // 有5个再同一行，胜出
                return true;
            }
        }
        // 未达到胜利条件
        return false;
    }


}


