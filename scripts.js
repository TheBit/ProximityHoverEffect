const MOUSE_CURSOR = 'MOUSE_CURSOR';
const setupLineSegmentAngleMouseMove = '--setupLineSegmentAngleMouseMove-';
const lineSegmentAngleMouseMove = '--lineSegmentAngleMouseMove-';
const configOptionsSeparator = ',';

const root = document.querySelector(':root');

function getCssVar(name) {
    return getComputedStyle(root).getPropertyValue(name);
}
function setCssVar(name, value) {
    root.style.setProperty(name, value);
}
function angle(pointA, pointB){
    return Math.atan2(pointA.y - pointB.y, pointA.x - pointB.x);
}
function toDegree(radians) {
    return (180 / Math.PI) * radians;
}
function getAllGlobalCssVars(startsWithName) {
    return Array.from(document.styleSheets)
      .filter(
        sheet =>
          sheet.href === null || sheet.href.startsWith(window.location.origin)
      )
      .reduce(
        (acc, sheet) =>
          (acc = [
              ...acc,
              ...Array.from(sheet.cssRules).reduce(
                (def, rule) =>
                  (def =
                    rule.selectorText === ":root"
                      ? [
                          ...def,
                          ...Array.from(rule.style).filter(name =>
                            name.startsWith(startsWithName)
                          )
                      ]
                      : def),
                []
              )
          ]),
        []
      );
}
function isXYPoint(point) {
    return point && point.x && Number.isFinite(point.x) && point.y && Number.isFinite(point.y);
}
function isMouseMoveConfigValid(pointA, pointB) {
    return (isXYPoint(pointA) || pointA === MOUSE_CURSOR) && (isXYPoint(pointB) || pointB === MOUSE_CURSOR);
}
// TODO: add distance https://p5js.org/reference/#/p5/dist (with map https://p5js.org/reference/#/p5/map) support.
function initAngleMouseMoveLineSegments() {
    const angleMouseMoveLineSegments = getAllGlobalCssVars(setupLineSegmentAngleMouseMove);
    const angleMouseMoveLineSegmentsNames = angleMouseMoveLineSegments.map(varName => varName.slice(varName.lastIndexOf('-') + 1));
    if (angleMouseMoveLineSegmentsNames.length > 0) {
        angleMouseMoveLineSegmentsNames.forEach(lineSegment => {
            const lineSegmentConfig = getCssVar(`${setupLineSegmentAngleMouseMove}${lineSegment}`);
            let pointA, pointB;
            lineSegmentConfig.split(configOptionsSeparator).forEach((option, index) => {
                const selector = option.trim();
                if (selector && selector !== MOUSE_CURSOR) {
                    const currentPointContainer = document.querySelector(selector);
                    if (currentPointContainer) {
                        const { left, top, width, height} = currentPointContainer.getBoundingClientRect();
                        let currentPoint = {
                            x: left + width / 2,
                            y: top + height / 2
                        }
                        if (index === 0) {
                            pointA = currentPoint;
                        } else {
                            pointB = currentPoint;
                        }
                    }
                } else if (selector === MOUSE_CURSOR) {
                    if (index === 0) {
                        pointA = MOUSE_CURSOR;
                    } else {
                        pointB = MOUSE_CURSOR;
                    }
                }
            });
            if (isMouseMoveConfigValid(pointA, pointB)) {
                document.addEventListener('mousemove', ({ clientX: mouseX, clientY: mouseY}) => {
                    const mouse = {
                        x: mouseX,
                        y: mouseY
                    };
                    const angleDeg = toDegree(angle(pointA === MOUSE_CURSOR ? mouse : pointA, pointB === MOUSE_CURSOR ? mouse : pointB));
                    setCssVar(`${lineSegmentAngleMouseMove}${lineSegment}`, `${angleDeg}deg`);
                })
            } else {
                console.warn(`${lineSegment} configuration is invalid. Please check if your CSS Var follows this convention: \`--setupLineSegmentAngleMouseMove-{LINE_SEGMENT_NAME}: {POINT_A_SELECTOR}, {POINT_B_SELECTOR};\` Where each selector should be a valid CSS selector which returns existing node or should be equal to \`MOUSE_CURSOR\` string constant.`);
            }
        });
    }
}

window.addEventListener("load", (event) => {
    initAngleMouseMoveLineSegments();
});