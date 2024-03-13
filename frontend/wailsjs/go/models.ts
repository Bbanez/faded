export namespace bcms {
	
	export class FddBaseStatsGroup {
	    str: number;
	    str_to_hp: number;
	    str_to_dmg: number;
	    agi: number;
	    agi_to_move_speed: number;
	    agi_to_dmg: number;
	    int: number;
	    int_to_mana: number;
	    int_to_dmg: number;
	    hp: number;
	    mana: number;
	    stamina: number;
	    move_speed: number;
	    armor: number;
	    range: number;
	    damage: number;
	
	    static createFrom(source: any = {}) {
	        return new FddBaseStatsGroup(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.str = source["str"];
	        this.str_to_hp = source["str_to_hp"];
	        this.str_to_dmg = source["str_to_dmg"];
	        this.agi = source["agi"];
	        this.agi_to_move_speed = source["agi_to_move_speed"];
	        this.agi_to_dmg = source["agi_to_dmg"];
	        this.int = source["int"];
	        this.int_to_mana = source["int_to_mana"];
	        this.int_to_dmg = source["int_to_dmg"];
	        this.hp = source["hp"];
	        this.mana = source["mana"];
	        this.stamina = source["stamina"];
	        this.move_speed = source["move_speed"];
	        this.armor = source["armor"];
	        this.range = source["range"];
	        this.damage = source["damage"];
	    }
	}
	export class FddBoundingBoxGroup {
	    x: number;
	    y: number;
	    z: number;
	
	    static createFrom(source: any = {}) {
	        return new FddBoundingBoxGroup(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.x = source["x"];
	        this.y = source["y"];
	        this.z = source["z"];
	    }
	}
	export class MediaParsed {
	    _id: string;
	    src: string;
	    svg: string;
	    alt_text: string;
	    caption: string;
	    height: number;
	    width: number;
	    name: string;
	    type: string;
	
	    static createFrom(source: any = {}) {
	        return new MediaParsed(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this._id = source["_id"];
	        this.src = source["src"];
	        this.svg = source["svg"];
	        this.alt_text = source["alt_text"];
	        this.caption = source["caption"];
	        this.height = source["height"];
	        this.width = source["width"];
	        this.name = source["name"];
	        this.type = source["type"];
	    }
	}
	export class FddCharacterAnimationGroup {
	    t_pose: MediaParsed;
	    idle: MediaParsed;
	    run: MediaParsed;
	    death: MediaParsed;
	
	    static createFrom(source: any = {}) {
	        return new FddCharacterAnimationGroup(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.t_pose = this.convertValues(source["t_pose"], MediaParsed);
	        this.idle = this.convertValues(source["idle"], MediaParsed);
	        this.run = this.convertValues(source["run"], MediaParsed);
	        this.death = this.convertValues(source["death"], MediaParsed);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class FddCharacterEntryMetaItem {
	    title: string;
	    slug: string;
	    description: string;
	    avatar: MediaParsed;
	    base_stats: FddBaseStatsGroup;
	    bb: FddBoundingBoxGroup;
	    animation: FddCharacterAnimationGroup;
	
	    static createFrom(source: any = {}) {
	        return new FddCharacterEntryMetaItem(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.title = source["title"];
	        this.slug = source["slug"];
	        this.description = source["description"];
	        this.avatar = this.convertValues(source["avatar"], MediaParsed);
	        this.base_stats = this.convertValues(source["base_stats"], FddBaseStatsGroup);
	        this.bb = this.convertValues(source["bb"], FddBoundingBoxGroup);
	        this.animation = this.convertValues(source["animation"], FddCharacterAnimationGroup);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

export namespace game {
	
	export class Model {
	    id: string;
	    createdAt: number;
	    updatedAt: number;
	
	    static createFrom(source: any = {}) {
	        return new Model(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.createdAt = source["createdAt"];
	        this.updatedAt = source["updatedAt"];
	    }
	}
	export class Account {
	    model: Model;
	    username: string;
	
	    static createFrom(source: any = {}) {
	        return new Account(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.model = this.convertValues(source["model"], Model);
	        this.username = source["username"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class BoundingBoxCorners {
	    top: number;
	    right: number;
	    bottom: number;
	    left: number;
	
	    static createFrom(source: any = {}) {
	        return new BoundingBoxCorners(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.top = source["top"];
	        this.right = source["right"];
	        this.bottom = source["bottom"];
	        this.left = source["left"];
	    }
	}
	export class Size {
	    width: number;
	    height: number;
	
	    static createFrom(source: any = {}) {
	        return new Size(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.width = source["width"];
	        this.height = source["height"];
	    }
	}
	export class Point {
	    x: number;
	    y: number;
	
	    static createFrom(source: any = {}) {
	        return new Point(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.x = source["x"];
	        this.y = source["y"];
	    }
	}
	export class BoundingBox {
	    position: Point;
	    size: Size;
	    corners: BoundingBoxCorners;
	
	    static createFrom(source: any = {}) {
	        return new BoundingBox(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.position = this.convertValues(source["position"], Point);
	        this.size = this.convertValues(source["size"], Size);
	        this.corners = this.convertValues(source["corners"], BoundingBoxCorners);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	export class MathFnLinear2D {
	    points: Point[];
	    k: number[];
	    n: number[];
	
	    static createFrom(source: any = {}) {
	        return new MathFnLinear2D(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.points = this.convertValues(source["points"], Point);
	        this.k = source["k"];
	        this.n = source["n"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class MapRVTransform {
	    x: MathFnLinear2D;
	    y: MathFnLinear2D;
	
	    static createFrom(source: any = {}) {
	        return new MapRVTransform(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.x = this.convertValues(source["x"], MathFnLinear2D);
	        this.y = this.convertValues(source["y"], MathFnLinear2D);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class USize {
	    width: number;
	    height: number;
	
	    static createFrom(source: any = {}) {
	        return new USize(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.width = source["width"];
	        this.height = source["height"];
	    }
	}
	export class MapVNodeNeighborIdx {
	    topLeft: number;
	    topMiddle: number;
	    topRight: number;
	    middleRight: number;
	    bottomRight: number;
	    bottomMiddle: number;
	    bottomLeft: number;
	    middleLeft: number;
	
	    static createFrom(source: any = {}) {
	        return new MapVNodeNeighborIdx(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.topLeft = source["topLeft"];
	        this.topMiddle = source["topMiddle"];
	        this.topRight = source["topRight"];
	        this.middleRight = source["middleRight"];
	        this.bottomRight = source["bottomRight"];
	        this.bottomMiddle = source["bottomMiddle"];
	        this.bottomLeft = source["bottomLeft"];
	        this.middleLeft = source["middleLeft"];
	    }
	}
	export class UPoint {
	    x: number;
	    y: number;
	
	    static createFrom(source: any = {}) {
	        return new UPoint(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.x = source["x"];
	        this.y = source["y"];
	    }
	}
	export class MapNode {
	    g: number;
	    h: number;
	    position: UPoint;
	    mapPosition: Point;
	    partnerIdx?: number;
	    neighborIdx: MapVNodeNeighborIdx;
	    walkable: boolean;
	
	    static createFrom(source: any = {}) {
	        return new MapNode(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.g = source["g"];
	        this.h = source["h"];
	        this.position = this.convertValues(source["position"], UPoint);
	        this.mapPosition = this.convertValues(source["mapPosition"], Point);
	        this.partnerIdx = source["partnerIdx"];
	        this.neighborIdx = this.convertValues(source["neighborIdx"], MapVNodeNeighborIdx);
	        this.walkable = source["walkable"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class MapInfo {
	    nodes: MapNode[];
	    size: USize;
	    mapSize: Size;
	    mapNodeSize: Size;
	    rvTransform: MapRVTransform;
	
	    static createFrom(source: any = {}) {
	        return new MapInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.nodes = this.convertValues(source["nodes"], MapNode);
	        this.size = this.convertValues(source["size"], USize);
	        this.mapSize = this.convertValues(source["mapSize"], Size);
	        this.mapNodeSize = this.convertValues(source["mapNodeSize"], Size);
	        this.rvTransform = this.convertValues(source["rvTransform"], MapRVTransform);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	
	
	
	
	export class PlayerStats {
	    str: number;
	    agi: number;
	    int: number;
	    mapHp: number;
	    hp: number;
	    maxMana: number;
	    mana: number;
	    MaxStamina: number;
	    stamina: number;
	    moveSpeed: number;
	    attackSpeed: number;
	    armor: number;
	    range: number;
	    // Go type: PlayerStatsDamage
	    damage: any;
	
	    static createFrom(source: any = {}) {
	        return new PlayerStats(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.str = source["str"];
	        this.agi = source["agi"];
	        this.int = source["int"];
	        this.mapHp = source["mapHp"];
	        this.hp = source["hp"];
	        this.maxMana = source["maxMana"];
	        this.mana = source["mana"];
	        this.MaxStamina = source["MaxStamina"];
	        this.stamina = source["stamina"];
	        this.moveSpeed = source["moveSpeed"];
	        this.attackSpeed = source["attackSpeed"];
	        this.armor = source["armor"];
	        this.range = source["range"];
	        this.damage = this.convertValues(source["damage"], null);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Player {
	    character: bcms.FddCharacterEntryMetaItem;
	    stats: PlayerStats;
	    angle: number;
	    motion: Point;
	    boundingBox: BoundingBox;
	    wantedPositions?: Point[];
	    wantedPosition?: Point;
	
	    static createFrom(source: any = {}) {
	        return new Player(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.character = this.convertValues(source["character"], bcms.FddCharacterEntryMetaItem);
	        this.stats = this.convertValues(source["stats"], PlayerStats);
	        this.angle = source["angle"];
	        this.motion = this.convertValues(source["motion"], Point);
	        this.boundingBox = this.convertValues(source["boundingBox"], BoundingBox);
	        this.wantedPositions = this.convertValues(source["wantedPositions"], Point);
	        this.wantedPosition = this.convertValues(source["wantedPosition"], Point);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	
	export class SettingsResolution {
	    width: number;
	
	    static createFrom(source: any = {}) {
	        return new SettingsResolution(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.width = source["width"];
	    }
	}
	export class Settings {
	    model: Model;
	    resolution: SettingsResolution;
	
	    static createFrom(source: any = {}) {
	        return new Settings(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.model = this.convertValues(source["model"], Model);
	        this.resolution = this.convertValues(source["resolution"], SettingsResolution);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	
	

}

