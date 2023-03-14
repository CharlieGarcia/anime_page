'use strict';
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
  var exports = {};
  exports.id = 'pages/details/[id]';
  exports.ids = ['pages/details/[id]'];
  exports.modules = {
    /***/ './helpers/request.js':
      /*!****************************!*\
  !*** ./helpers/request.js ***!
  \****************************/
      /***/ (
        __unused_webpack_module,
        __webpack_exports__,
        __webpack_require__
      ) => {
        eval(
          '__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   "fetch": () => (/* binding */ fetch),\n/* harmony export */   "formatGenres": () => (/* binding */ formatGenres)\n/* harmony export */ });\n/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! axios */ "axios");\n/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(axios__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var lodash_map__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! lodash/map */ "lodash/map");\n/* harmony import */ var lodash_map__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(lodash_map__WEBPACK_IMPORTED_MODULE_1__);\n\n\nconst API_ENDPOINT = "https://kitsu.io/api/edge";\nfunction fetch(endPoint, params) {\n  return axios__WEBPACK_IMPORTED_MODULE_0___default().get(`${API_ENDPOINT}${endPoint}`, {\n    params\n  });\n}\n;\nfunction formatGenres(genres) {\n  return lodash_map__WEBPACK_IMPORTED_MODULE_1___default()(genres, \'attributes.slug\') || [];\n}\n;//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9oZWxwZXJzL3JlcXVlc3QuanMuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUVBLE1BQU1FLFlBQVksR0FBR0MsMkJBQXJCO0FBRU8sU0FBU0csS0FBVCxDQUFlQyxRQUFmLEVBQXlCQyxNQUF6QixFQUFpQztFQUN0QyxPQUFPUixnREFBQSxDQUFXLEdBQUVFLFlBQWEsR0FBRUssUUFBUyxFQUFyQyxFQUF3QztJQUFFQztFQUFGLENBQXhDLENBQVA7QUFDRDtBQUFBO0FBRU0sU0FBU0UsWUFBVCxDQUFzQkMsTUFBdEIsRUFBOEI7RUFDbkMsT0FBT1YsaURBQUksQ0FBQ1UsTUFBRCxFQUFTLGlCQUFULENBQUosSUFBbUMsRUFBMUM7QUFDRDtBQUFBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vYW5pbWVfcGFnZS8uL2hlbHBlcnMvcmVxdWVzdC5qcz8yZGNkIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBheGlvcyBmcm9tICdheGlvcyc7XHJcbmltcG9ydCBfbWFwIGZyb20gJ2xvZGFzaC9tYXAnO1xyXG5cclxuY29uc3QgQVBJX0VORFBPSU5UID0gcHJvY2Vzcy5lbnYuTkVYVF9QVUJMSUNfQVBJX0VORFBPSU5UO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGZldGNoKGVuZFBvaW50LCBwYXJhbXMpIHtcclxuICByZXR1cm4gYXhpb3MuZ2V0KGAke0FQSV9FTkRQT0lOVH0ke2VuZFBvaW50fWAsIHsgcGFyYW1zIH0pO1xyXG59O1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGZvcm1hdEdlbnJlcyhnZW5yZXMpIHtcclxuICByZXR1cm4gX21hcChnZW5yZXMsICdhdHRyaWJ1dGVzLnNsdWcnKSB8fCBbXTtcclxufTtcclxuIl0sIm5hbWVzIjpbImF4aW9zIiwiX21hcCIsIkFQSV9FTkRQT0lOVCIsInByb2Nlc3MiLCJlbnYiLCJORVhUX1BVQkxJQ19BUElfRU5EUE9JTlQiLCJmZXRjaCIsImVuZFBvaW50IiwicGFyYW1zIiwiZ2V0IiwiZm9ybWF0R2VucmVzIiwiZ2VucmVzIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./helpers/request.js\n'
        );

        /***/
      },

    /***/ './pages/details/[id].js':
      /*!*******************************!*\
  !*** ./pages/details/[id].js ***!
  \*******************************/
      /***/ (
        __unused_webpack_module,
        __webpack_exports__,
        __webpack_require__
      ) => {
        eval(
          '__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/router */ "next/router");\n/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(next_router__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var lodash_get__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! lodash/get */ "lodash/get");\n/* harmony import */ var lodash_get__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(lodash_get__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _helpers_request__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../helpers/request */ "./helpers/request.js");\n\n\n\n\n\nfunction Detail() {\n  const router = (0,next_router__WEBPACK_IMPORTED_MODULE_1__.useRouter)();\n  const {\n    id\n  } = router.query;\n  const [state, setState] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)({\n    info: {},\n    infoStatus: false\n  });\n  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {\n    setState(existingState => ({ ...existingState,\n      infoStatus: true\n    }));\n\n    const fetchInfo = async () => {\n      if (!router.isReady) return;\n\n      const _info = await (0,_helpers_request__WEBPACK_IMPORTED_MODULE_3__.fetch)(`/anime/${id}`);\n\n      setState(existingState => ({ ...existingState,\n        info: lodash_get__WEBPACK_IMPORTED_MODULE_2___default()(_info, \'data.data\') || {},\n        infoStatus: false\n      }));\n    };\n\n    fetchInfo();\n  }, [router.isReady, id]);\n  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", null, "Detail page", state.infoStatus ? \'Loading ...\' : /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", null, JSON.stringify(state.info, null, 2)));\n}\n\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Detail);//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9wYWdlcy9kZXRhaWxzL1tpZF0uanMuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxTQUFTTSxNQUFULEdBQWtCO0VBQ2hCLE1BQU1DLE1BQU0sR0FBR0osc0RBQVMsRUFBeEI7RUFDQSxNQUFNO0lBQUVLO0VBQUYsSUFBU0QsTUFBTSxDQUFDRSxLQUF0QjtFQUNBLE1BQU0sQ0FBQ0MsS0FBRCxFQUFRQyxRQUFSLElBQW9CVCwrQ0FBUSxDQUFDO0lBQ2pDVSxJQUFJLEVBQUUsRUFEMkI7SUFFakNDLFVBQVUsRUFBRTtFQUZxQixDQUFELENBQWxDO0VBS0FaLGdEQUFTLENBQUMsTUFBTTtJQUNkVSxRQUFRLENBQUVHLGFBQUQsS0FBb0IsRUFDM0IsR0FBR0EsYUFEd0I7TUFFM0JELFVBQVUsRUFBRTtJQUZlLENBQXBCLENBQUQsQ0FBUjs7SUFLQSxNQUFNRSxTQUFTLEdBQUcsWUFBWTtNQUM1QixJQUFJLENBQUNSLE1BQU0sQ0FBQ1MsT0FBWixFQUFxQjs7TUFDckIsTUFBTUMsS0FBSyxHQUFHLE1BQU1aLHVEQUFLLENBQUUsVUFBU0csRUFBRyxFQUFkLENBQXpCOztNQUVBRyxRQUFRLENBQUVHLGFBQUQsS0FBb0IsRUFDM0IsR0FBR0EsYUFEd0I7UUFFM0JGLElBQUksRUFBRVIsaURBQUksQ0FBQ2EsS0FBRCxFQUFRLFdBQVIsQ0FBSixJQUE0QixFQUZQO1FBRzNCSixVQUFVLEVBQUU7TUFIZSxDQUFwQixDQUFELENBQVI7SUFLRCxDQVREOztJQVdBRSxTQUFTO0VBQ1YsQ0FsQlEsRUFrQk4sQ0FBQ1IsTUFBTSxDQUFDUyxPQUFSLEVBQWlCUixFQUFqQixDQWxCTSxDQUFUO0VBb0JBLG9CQUNFLHdFQUFLLGFBQUwsRUFFR0UsS0FBSyxDQUFDRyxVQUFOLEdBQ0MsYUFERCxnQkFHQyxzRUFBSUssSUFBSSxDQUFDQyxTQUFMLENBQWVULEtBQUssQ0FBQ0UsSUFBckIsRUFBMkIsSUFBM0IsRUFBaUMsQ0FBakMsQ0FBSixDQUxKLENBREY7QUFVRDs7QUFFRCxpRUFBZU4sTUFBZiIsInNvdXJjZXMiOlsid2VicGFjazovL2FuaW1lX3BhZ2UvLi9wYWdlcy9kZXRhaWxzL1tpZF0uanM/MmJhZiJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QsIHsgdXNlRWZmZWN0LCB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IHVzZVJvdXRlciB9IGZyb20gJ25leHQvcm91dGVyJztcbmltcG9ydCBfZ2V0IGZyb20gJ2xvZGFzaC9nZXQnO1xuaW1wb3J0IHsgZmV0Y2ggfSBmcm9tICcuLi8uLi9oZWxwZXJzL3JlcXVlc3QnO1xuXG5mdW5jdGlvbiBEZXRhaWwoKSB7XG4gIGNvbnN0IHJvdXRlciA9IHVzZVJvdXRlcigpO1xuICBjb25zdCB7IGlkIH0gPSByb3V0ZXIucXVlcnk7XG4gIGNvbnN0IFtzdGF0ZSwgc2V0U3RhdGVdID0gdXNlU3RhdGUoe1xuICAgIGluZm86IHt9LFxuICAgIGluZm9TdGF0dXM6IGZhbHNlXG4gIH0pO1xuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgc2V0U3RhdGUoKGV4aXN0aW5nU3RhdGUpID0+ICh7XG4gICAgICAuLi5leGlzdGluZ1N0YXRlLFxuICAgICAgaW5mb1N0YXR1czogdHJ1ZVxuICAgIH0pKTtcblxuICAgIGNvbnN0IGZldGNoSW5mbyA9IGFzeW5jICgpID0+IHtcbiAgICAgIGlmICghcm91dGVyLmlzUmVhZHkpIHJldHVybjtcbiAgICAgIGNvbnN0IF9pbmZvID0gYXdhaXQgZmV0Y2goYC9hbmltZS8ke2lkfWApO1xuXG4gICAgICBzZXRTdGF0ZSgoZXhpc3RpbmdTdGF0ZSkgPT4gKHtcbiAgICAgICAgLi4uZXhpc3RpbmdTdGF0ZSxcbiAgICAgICAgaW5mbzogX2dldChfaW5mbywgJ2RhdGEuZGF0YScpIHx8IHt9LFxuICAgICAgICBpbmZvU3RhdHVzOiBmYWxzZVxuICAgICAgfSkpO1xuICAgIH07XG5cbiAgICBmZXRjaEluZm8oKTtcbiAgfSwgW3JvdXRlci5pc1JlYWR5LCBpZF0pO1xuXG4gIHJldHVybiAoXG4gICAgPGRpdj5cbiAgICAgIERldGFpbCBwYWdlXG4gICAgICB7c3RhdGUuaW5mb1N0YXR1cyA/IChcbiAgICAgICAgJ0xvYWRpbmcgLi4uJ1xuICAgICAgKSA6IChcbiAgICAgICAgPHA+e0pTT04uc3RyaW5naWZ5KHN0YXRlLmluZm8sIG51bGwsIDIpfTwvcD5cbiAgICAgICl9XG4gICAgPC9kaXY+XG4gICk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IERldGFpbDtcbiJdLCJuYW1lcyI6WyJSZWFjdCIsInVzZUVmZmVjdCIsInVzZVN0YXRlIiwidXNlUm91dGVyIiwiX2dldCIsImZldGNoIiwiRGV0YWlsIiwicm91dGVyIiwiaWQiLCJxdWVyeSIsInN0YXRlIiwic2V0U3RhdGUiLCJpbmZvIiwiaW5mb1N0YXR1cyIsImV4aXN0aW5nU3RhdGUiLCJmZXRjaEluZm8iLCJpc1JlYWR5IiwiX2luZm8iLCJKU09OIiwic3RyaW5naWZ5Il0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./pages/details/[id].js\n'
        );

        /***/
      },

    /***/ axios:
      /*!************************!*\
  !*** external "axios" ***!
  \************************/
      /***/ (module) => {
        module.exports = require('axios');

        /***/
      },

    /***/ 'lodash/get':
      /*!*****************************!*\
  !*** external "lodash/get" ***!
  \*****************************/
      /***/ (module) => {
        module.exports = require('lodash/get');

        /***/
      },

    /***/ 'lodash/map':
      /*!*****************************!*\
  !*** external "lodash/map" ***!
  \*****************************/
      /***/ (module) => {
        module.exports = require('lodash/map');

        /***/
      },

    /***/ 'next/router':
      /*!******************************!*\
  !*** external "next/router" ***!
  \******************************/
      /***/ (module) => {
        module.exports = require('next/router');

        /***/
      },

    /***/ react:
      /*!************************!*\
  !*** external "react" ***!
  \************************/
      /***/ (module) => {
        module.exports = require('react');

        /***/
      }
  };
  // load runtime
  var __webpack_require__ = require('../../webpack-runtime.js');
  __webpack_require__.C(exports);
  var __webpack_exec__ = (moduleId) =>
    __webpack_require__((__webpack_require__.s = moduleId));
  var __webpack_exports__ = __webpack_exec__('./pages/details/[id].js');
  module.exports = __webpack_exports__;
})();
