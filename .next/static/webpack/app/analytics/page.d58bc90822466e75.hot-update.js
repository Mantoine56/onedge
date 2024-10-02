"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
self["webpackHotUpdate_N_E"]("app/analytics/page",{

/***/ "(app-pages-browser)/./hooks/useTransactions.ts":
/*!**********************************!*\
  !*** ./hooks/useTransactions.ts ***!
  \**********************************/
/***/ (function(module, __webpack_exports__, __webpack_require__) {

eval(__webpack_require__.ts("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   useTransactions: function() { return /* binding */ useTransactions; }\n/* harmony export */ });\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ \"(app-pages-browser)/./node_modules/next/dist/compiled/react/index.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var firebase_firestore__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! firebase/firestore */ \"(app-pages-browser)/./node_modules/firebase/firestore/dist/esm/index.esm.js\");\n/* harmony import */ var _app_firebase__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/app/firebase */ \"(app-pages-browser)/./app/firebase.ts\");\n/* harmony import */ var _app_hooks_useAuth__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/app/hooks/useAuth */ \"(app-pages-browser)/./app/hooks/useAuth.ts\");\n\n\n\n\n\nfunction useTransactions() {\n    const [transactions, setTransactions] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)([]);\n    const [metrics, setMetrics] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)({\n        totalThisYear: 0,\n        totalLastYear: 0,\n        totalThisMonth: 0,\n        totalLastMonth: 0,\n        totalToday: 0,\n        totalYesterday: 0,\n        averageTransaction: 0,\n        averageTransactionLastWeek: 0\n    });\n    const { user } = (0,_app_hooks_useAuth__WEBPACK_IMPORTED_MODULE_3__.useAuth)();\n    (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(()=>{\n        if (!user) return;\n        let unsubscribe;\n        const fetchTransactions = async ()=>{\n            let q;\n            if (user.role === \"admin\") {\n                q = (0,firebase_firestore__WEBPACK_IMPORTED_MODULE_1__.query)((0,firebase_firestore__WEBPACK_IMPORTED_MODULE_1__.collection)(_app_firebase__WEBPACK_IMPORTED_MODULE_2__.db, \"transactions\"), (0,firebase_firestore__WEBPACK_IMPORTED_MODULE_1__.where)(\"adminId\", \"==\", user.uid));\n            } else {\n                q = (0,firebase_firestore__WEBPACK_IMPORTED_MODULE_1__.query)((0,firebase_firestore__WEBPACK_IMPORTED_MODULE_1__.collection)(_app_firebase__WEBPACK_IMPORTED_MODULE_2__.db, \"transactions\"), (0,firebase_firestore__WEBPACK_IMPORTED_MODULE_1__.where)(\"createdBy\", \"==\", user.uid));\n            }\n            unsubscribe = (0,firebase_firestore__WEBPACK_IMPORTED_MODULE_1__.onSnapshot)(q, (querySnapshot)=>{\n                const transactionsData = [];\n                querySnapshot.forEach((doc)=>{\n                    const data = doc.data();\n                    transactionsData.push({\n                        id: doc.id,\n                        amount: data.amount,\n                        customerName: data.customerName,\n                        notes: data.notes,\n                        date: data.date.toDate(),\n                        createdBy: data.createdBy\n                    });\n                });\n                setTransactions(transactionsData);\n                calculateMetrics(transactionsData);\n            });\n        };\n        fetchTransactions();\n        return ()=>{\n            if (unsubscribe) {\n                unsubscribe();\n            }\n        };\n    }, [\n        user\n    ]);\n    const calculateMetrics = (transactions)=>{\n        const now = new Date();\n        const thisYear = now.getFullYear();\n        const thisMonth = now.getMonth();\n        const today = now.getDate();\n        const thisYearTransactions = transactions.filter((t)=>t.date.getFullYear() === thisYear);\n        const lastYearTransactions = transactions.filter((t)=>t.date.getFullYear() === thisYear - 1);\n        const thisMonthTransactions = thisYearTransactions.filter((t)=>t.date.getMonth() === thisMonth);\n        const lastMonthTransactions = thisYearTransactions.filter((t)=>t.date.getMonth() === thisMonth - 1);\n        const todayTransactions = thisMonthTransactions.filter((t)=>t.date.getDate() === today);\n        const yesterdayTransactions = thisMonthTransactions.filter((t)=>t.date.getDate() === today - 1);\n        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);\n        const lastWeekTransactions = transactions.filter((t)=>t.date >= oneWeekAgo && t.date < now);\n        const totalThisYear = thisYearTransactions.reduce((sum, t)=>sum + t.amount, 0);\n        const totalLastYear = lastYearTransactions.reduce((sum, t)=>sum + t.amount, 0);\n        const totalThisMonth = thisMonthTransactions.reduce((sum, t)=>sum + t.amount, 0);\n        const totalLastMonth = lastMonthTransactions.reduce((sum, t)=>sum + t.amount, 0);\n        const totalToday = todayTransactions.reduce((sum, t)=>sum + t.amount, 0);\n        const totalYesterday = yesterdayTransactions.reduce((sum, t)=>sum + t.amount, 0);\n        const averageTransaction = totalThisYear / thisYearTransactions.length || 0;\n        const averageTransactionLastWeek = lastWeekTransactions.reduce((sum, t)=>sum + t.amount, 0) / lastWeekTransactions.length || 0;\n        setMetrics({\n            totalThisYear,\n            totalLastYear,\n            totalThisMonth,\n            totalLastMonth,\n            totalToday,\n            totalYesterday,\n            averageTransaction,\n            averageTransactionLastWeek\n        });\n    };\n    const addTransaction = async (transaction)=>{\n        if (!user) throw new Error(\"User not authenticated\");\n        const newTransaction = {\n            ...transaction,\n            createdBy: user.uid,\n            date: firebase_firestore__WEBPACK_IMPORTED_MODULE_1__.Timestamp.now()\n        };\n        if (user.role === \"admin\") {\n            newTransaction.adminId = user.uid;\n        } else if (user.role === \"employee\") {\n            // For employees, we need to fetch their admin's ID\n            const userDoc = await getDoc((0,firebase_firestore__WEBPACK_IMPORTED_MODULE_1__.doc)(_app_firebase__WEBPACK_IMPORTED_MODULE_2__.db, \"users\", user.uid));\n            const userData = userDoc.data();\n            if (userData && userData.adminId) {\n                newTransaction.adminId = userData.adminId;\n            } else {\n                throw new Error(\"Employee is not associated with an admin\");\n            }\n        }\n        await (0,firebase_firestore__WEBPACK_IMPORTED_MODULE_1__.addDoc)((0,firebase_firestore__WEBPACK_IMPORTED_MODULE_1__.collection)(_app_firebase__WEBPACK_IMPORTED_MODULE_2__.db, \"transactions\"), newTransaction);\n    };\n    const deleteTransaction = async (id)=>{\n        if (!user) throw new Error(\"User not authenticated\");\n        if (user.role !== \"admin\") throw new Error(\"Unauthorized\");\n        await (0,firebase_firestore__WEBPACK_IMPORTED_MODULE_1__.deleteDoc)((0,firebase_firestore__WEBPACK_IMPORTED_MODULE_1__.doc)(_app_firebase__WEBPACK_IMPORTED_MODULE_2__.db, \"transactions\", id));\n    };\n    const deleteAllTransactions = async ()=>{\n        if (!user) throw new Error(\"User not authenticated\");\n        const q = (0,firebase_firestore__WEBPACK_IMPORTED_MODULE_1__.query)((0,firebase_firestore__WEBPACK_IMPORTED_MODULE_1__.collection)(_app_firebase__WEBPACK_IMPORTED_MODULE_2__.db, \"transactions\"), (0,firebase_firestore__WEBPACK_IMPORTED_MODULE_1__.where)(\"userId\", \"==\", user.uid));\n        const querySnapshot = await (0,firebase_firestore__WEBPACK_IMPORTED_MODULE_1__.getDocs)(q);\n        const batch = (0,firebase_firestore__WEBPACK_IMPORTED_MODULE_1__.writeBatch)(_app_firebase__WEBPACK_IMPORTED_MODULE_2__.db);\n        querySnapshot.forEach((doc)=>{\n            batch.delete(doc.ref);\n        });\n        await batch.commit();\n    };\n    return {\n        transactions,\n        addTransaction,\n        deleteTransaction,\n        deleteAllTransactions,\n        metrics\n    };\n}\n\n\n;\n    // Wrapped in an IIFE to avoid polluting the global scope\n    ;\n    (function () {\n        var _a, _b;\n        // Legacy CSS implementations will `eval` browser code in a Node.js context\n        // to extract CSS. For backwards compatibility, we need to check we're in a\n        // browser context before continuing.\n        if (typeof self !== 'undefined' &&\n            // AMP / No-JS mode does not inject these helpers:\n            '$RefreshHelpers$' in self) {\n            // @ts-ignore __webpack_module__ is global\n            var currentExports = module.exports;\n            // @ts-ignore __webpack_module__ is global\n            var prevSignature = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevSignature) !== null && _b !== void 0 ? _b : null;\n            // This cannot happen in MainTemplate because the exports mismatch between\n            // templating and execution.\n            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);\n            // A module can be accepted automatically based on its exports, e.g. when\n            // it is a Refresh Boundary.\n            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n                // Save the previous exports signature on update so we can compare the boundary\n                // signatures. We avoid saving exports themselves since it causes memory leaks (https://github.com/vercel/next.js/pull/53797)\n                module.hot.dispose(function (data) {\n                    data.prevSignature =\n                        self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports);\n                });\n                // Unconditionally accept an update to this module, we'll check if it's\n                // still a Refresh Boundary later.\n                // @ts-ignore importMeta is replaced in the loader\n                module.hot.accept();\n                // This field is set when the previous version of this module was a\n                // Refresh Boundary, letting us know we need to check for invalidation or\n                // enqueue an update.\n                if (prevSignature !== null) {\n                    // A boundary can become ineligible if its exports are incompatible\n                    // with the previous exports.\n                    //\n                    // For example, if you add/remove/change exports, we'll want to\n                    // re-execute the importing modules, and force those components to\n                    // re-render. Similarly, if you convert a class component to a\n                    // function, we want to invalidate the boundary.\n                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevSignature, self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports))) {\n                        module.hot.invalidate();\n                    }\n                    else {\n                        self.$RefreshHelpers$.scheduleUpdate();\n                    }\n                }\n            }\n            else {\n                // Since we just executed the code for the module, it's possible that the\n                // new exports made it ineligible for being a boundary.\n                // We only care about the case when we were _previously_ a boundary,\n                // because we already accepted this update (accidental side effect).\n                var isNoLongerABoundary = prevSignature !== null;\n                if (isNoLongerABoundary) {\n                    module.hot.invalidate();\n                }\n            }\n        }\n    })();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwcC1wYWdlcy1icm93c2VyKS8uL2hvb2tzL3VzZVRyYW5zYWN0aW9ucy50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBNEM7QUFDaUU7QUFDbkU7QUFDSTtBQUNXO0FBdUJsRCxTQUFTYztJQUNkLE1BQU0sQ0FBQ0MsY0FBY0MsZ0JBQWdCLEdBQUdoQiwrQ0FBUUEsQ0FBZ0IsRUFBRTtJQUNsRSxNQUFNLENBQUNpQixTQUFTQyxXQUFXLEdBQUdsQiwrQ0FBUUEsQ0FBVTtRQUM5Q21CLGVBQWU7UUFDZkMsZUFBZTtRQUNmQyxnQkFBZ0I7UUFDaEJDLGdCQUFnQjtRQUNoQkMsWUFBWTtRQUNaQyxnQkFBZ0I7UUFDaEJDLG9CQUFvQjtRQUNwQkMsNEJBQTRCO0lBQzlCO0lBQ0EsTUFBTSxFQUFFQyxJQUFJLEVBQUUsR0FBR2hCLDJEQUFPQTtJQUV4QlYsZ0RBQVNBLENBQUM7UUFDUixJQUFJLENBQUMwQixNQUFNO1FBRVgsSUFBSUM7UUFFSixNQUFNQyxvQkFBb0I7WUFDeEIsSUFBSUM7WUFDSixJQUFJSCxLQUFLSSxJQUFJLEtBQUssU0FBUztnQkFDekJELElBQUkzQix5REFBS0EsQ0FBQ0QsOERBQVVBLENBQUNRLDZDQUFFQSxFQUFFLGlCQUFpQk4seURBQUtBLENBQUMsV0FBVyxNQUFNdUIsS0FBS0ssR0FBRztZQUMzRSxPQUFPO2dCQUNMRixJQUFJM0IseURBQUtBLENBQUNELDhEQUFVQSxDQUFDUSw2Q0FBRUEsRUFBRSxpQkFBaUJOLHlEQUFLQSxDQUFDLGFBQWEsTUFBTXVCLEtBQUtLLEdBQUc7WUFDN0U7WUFFQUosY0FBY3ZCLDhEQUFVQSxDQUFDeUIsR0FBRyxDQUFDRztnQkFDM0IsTUFBTUMsbUJBQWtDLEVBQUU7Z0JBQzFDRCxjQUFjRSxPQUFPLENBQUMsQ0FBQzNCO29CQUNyQixNQUFNNEIsT0FBTzVCLElBQUk0QixJQUFJO29CQUNyQkYsaUJBQWlCRyxJQUFJLENBQUM7d0JBQ3BCQyxJQUFJOUIsSUFBSThCLEVBQUU7d0JBQ1ZDLFFBQVFILEtB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Z0QsUUFBUWpFLDhEQUFVQSxDQUFDSCw2Q0FBRUE7UUFDM0J1QixjQUFjRSxPQUFPLENBQUMsQ0FBQzNCO1lBQ3JCc0UsTUFBTUMsTUFBTSxDQUFDdkUsSUFBSXdFLEdBQUc7UUFDdEI7UUFFQSxNQUFNRixNQUFNRyxNQUFNO0lBQ3BCO0lBRUEsT0FBTztRQUFFbEU7UUFBY3FEO1FBQWdCUTtRQUFtQkM7UUFBdUI1RDtJQUFRO0FBQzNGIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vX05fRS8uL2hvb2tzL3VzZVRyYW5zYWN0aW9ucy50cz9lYjBjIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHVzZVN0YXRlLCB1c2VFZmZlY3QgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBjb2xsZWN0aW9uLCBxdWVyeSwgd2hlcmUsIG9uU25hcHNob3QsIGFkZERvYywgZGVsZXRlRG9jLCBkb2MsIFRpbWVzdGFtcCB9IGZyb20gJ2ZpcmViYXNlL2ZpcmVzdG9yZSc7XG5pbXBvcnQgeyBkYiwgYXV0aCB9IGZyb20gJ0AvYXBwL2ZpcmViYXNlJztcbmltcG9ydCB7IHVzZUF1dGggfSBmcm9tICdAL2FwcC9ob29rcy91c2VBdXRoJztcbmltcG9ydCB7IGdldERvY3MsIHdyaXRlQmF0Y2ggfSBmcm9tICdmaXJlYmFzZS9maXJlc3RvcmUnO1xuaW1wb3J0IHsgVXNlciB9IGZyb20gJ0AvYXBwL2hvb2tzL3VzZUF1dGgnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFRyYW5zYWN0aW9uIHtcbiAgaWQ6IHN0cmluZztcbiAgYW1vdW50OiBudW1iZXI7XG4gIGN1c3RvbWVyTmFtZTogc3RyaW5nO1xuICBub3Rlczogc3RyaW5nO1xuICBkYXRlOiBEYXRlO1xuICBjcmVhdGVkQnk6IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBNZXRyaWNzIHtcbiAgdG90YWxUaGlzWWVhcjogbnVtYmVyO1xuICB0b3RhbExhc3RZZWFyOiBudW1iZXI7XG4gIHRvdGFsVGhpc01vbnRoOiBudW1iZXI7XG4gIHRvdGFsTGFzdE1vbnRoOiBudW1iZXI7XG4gIHRvdGFsVG9kYXk6IG51bWJlcjtcbiAgdG90YWxZZXN0ZXJkYXk6IG51bWJlcjtcbiAgYXZlcmFnZVRyYW5zYWN0aW9uOiBudW1iZXI7XG4gIGF2ZXJhZ2VUcmFuc2FjdGlvbkxhc3RXZWVrOiBudW1iZXI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1c2VUcmFuc2FjdGlvbnMoKSB7XG4gIGNvbnN0IFt0cmFuc2FjdGlvbnMsIHNldFRyYW5zYWN0aW9uc10gPSB1c2VTdGF0ZTxUcmFuc2FjdGlvbltdPihbXSk7XG4gIGNvbnN0IFttZXRyaWNzLCBzZXRNZXRyaWNzXSA9IHVzZVN0YXRlPE1ldHJpY3M+KHtcbiAgICB0b3RhbFRoaXNZZWFyOiAwLFxuICAgIHRvdGFsTGFzdFllYXI6IDAsXG4gICAgdG90YWxUaGlzTW9udGg6IDAsXG4gICAgdG90YWxMYXN0TW9udGg6IDAsXG4gICAgdG90YWxUb2RheTogMCxcbiAgICB0b3RhbFllc3RlcmRheTogMCxcbiAgICBhdmVyYWdlVHJhbnNhY3Rpb246IDAsXG4gICAgYXZlcmFnZVRyYW5zYWN0aW9uTGFzdFdlZWs6IDAsXG4gIH0pO1xuICBjb25zdCB7IHVzZXIgfSA9IHVzZUF1dGgoKTtcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmICghdXNlcikgcmV0dXJuO1xuXG4gICAgbGV0IHVuc3Vic2NyaWJlOiAoKCkgPT4gdm9pZCkgfCB1bmRlZmluZWQ7XG5cbiAgICBjb25zdCBmZXRjaFRyYW5zYWN0aW9ucyA9IGFzeW5jICgpID0+IHtcbiAgICAgIGxldCBxO1xuICAgICAgaWYgKHVzZXIucm9sZSA9PT0gJ2FkbWluJykge1xuICAgICAgICBxID0gcXVlcnkoY29sbGVjdGlvbihkYiwgJ3RyYW5zYWN0aW9ucycpLCB3aGVyZSgnYWRtaW5JZCcsICc9PScsIHVzZXIudWlkKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBxID0gcXVlcnkoY29sbGVjdGlvbihkYiwgJ3RyYW5zYWN0aW9ucycpLCB3aGVyZSgnY3JlYXRlZEJ5JywgJz09JywgdXNlci51aWQpKTtcbiAgICAgIH1cblxuICAgICAgdW5zdWJzY3JpYmUgPSBvblNuYXBzaG90KHEsIChxdWVyeVNuYXBzaG90KSA9PiB7XG4gICAgICAgIGNvbnN0IHRyYW5zYWN0aW9uc0RhdGE6IFRyYW5zYWN0aW9uW10gPSBbXTtcbiAgICAgICAgcXVlcnlTbmFwc2hvdC5mb3JFYWNoKChkb2MpID0+IHtcbiAgICAgICAgICBjb25zdCBkYXRhID0gZG9jLmRhdGEoKTtcbiAgICAgICAgICB0cmFuc2FjdGlvbnNEYXRhLnB1c2goe1xuICAgICAgICAgICAgaWQ6IGRvYy5pZCxcbiAgICAgICAgICAgIGFtb3VudDogZGF0YS5hbW91bnQsXG4gICAgICAgICAgICBjdXN0b21lck5hbWU6IGRhdGEuY3VzdG9tZXJOYW1lLFxuICAgICAgICAgICAgbm90ZXM6IGRhdGEubm90ZXMsXG4gICAgICAgICAgICBkYXRlOiBkYXRhLmRhdGUudG9EYXRlKCksXG4gICAgICAgICAgICBjcmVhdGVkQnk6IGRhdGEuY3JlYXRlZEJ5LFxuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgc2V0VHJhbnNhY3Rpb25zKHRyYW5zYWN0aW9uc0RhdGEpO1xuICAgICAgICBjYWxjdWxhdGVNZXRyaWNzKHRyYW5zYWN0aW9uc0RhdGEpO1xuICAgICAgfSk7XG4gICAgfTtcblxuICAgIGZldGNoVHJhbnNhY3Rpb25zKCk7XG5cbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgaWYgKHVuc3Vic2NyaWJlKSB7XG4gICAgICAgIHVuc3Vic2NyaWJlKCk7XG4gICAgICB9XG4gICAgfTtcbiAgfSwgW3VzZXJdKTtcblxuICBjb25zdCBjYWxjdWxhdGVNZXRyaWNzID0gKHRyYW5zYWN0aW9uczogVHJhbnNhY3Rpb25bXSkgPT4ge1xuICAgIGNvbnN0IG5vdyA9IG5ldyBEYXRlKCk7XG4gICAgY29uc3QgdGhpc1llYXIgPSBub3cuZ2V0RnVsbFllYXIoKTtcbiAgICBjb25zdCB0aGlzTW9udGggPSBub3cuZ2V0TW9udGgoKTtcbiAgICBjb25zdCB0b2RheSA9IG5vdy5nZXREYXRlKCk7XG5cbiAgICBjb25zdCB0aGlzWWVhclRyYW5zYWN0aW9ucyA9IHRyYW5zYWN0aW9ucy5maWx0ZXIodCA9PiB0LmRhdGUuZ2V0RnVsbFllYXIoKSA9PT0gdGhpc1llYXIpO1xuICAgIGNvbnN0IGxhc3RZZWFyVHJhbnNhY3Rpb25zID0gdHJhbnNhY3Rpb25zLmZpbHRlcih0ID0+IHQuZGF0ZS5nZXRGdWxsWWVhcigpID09PSB0aGlzWWVhciAtIDEpO1xuICAgIGNvbnN0IHRoaXNNb250aFRyYW5zYWN0aW9ucyA9IHRoaXNZZWFyVHJhbnNhY3Rpb25zLmZpbHRlcih0ID0+IHQuZGF0ZS5nZXRNb250aCgpID09PSB0aGlzTW9udGgpO1xuICAgIGNvbnN0IGxhc3RNb250aFRyYW5zYWN0aW9ucyA9IHRoaXNZZWFyVHJhbnNhY3Rpb25zLmZpbHRlcih0ID0+IHQuZGF0ZS5nZXRNb250aCgpID09PSB0aGlzTW9udGggLSAxKTtcbiAgICBjb25zdCB0b2RheVRyYW5zYWN0aW9ucyA9IHRoaXNNb250aFRyYW5zYWN0aW9ucy5maWx0ZXIodCA9PiB0LmRhdGUuZ2V0RGF0ZSgpID09PSB0b2RheSk7XG4gICAgY29uc3QgeWVzdGVyZGF5VHJhbnNhY3Rpb25zID0gdGhpc01vbnRoVHJhbnNhY3Rpb25zLmZpbHRlcih0ID0+IHQuZGF0ZS5nZXREYXRlKCkgPT09IHRvZGF5IC0gMSk7XG5cbiAgICBjb25zdCBvbmVXZWVrQWdvID0gbmV3IERhdGUobm93LmdldFRpbWUoKSAtIDcgKiAyNCAqIDYwICogNjAgKiAxMDAwKTtcbiAgICBjb25zdCBsYXN0V2Vla1RyYW5zYWN0aW9ucyA9IHRyYW5zYWN0aW9ucy5maWx0ZXIodCA9PiB0LmRhdGUgPj0gb25lV2Vla0FnbyAmJiB0LmRhdGUgPCBub3cpO1xuXG4gICAgY29uc3QgdG90YWxUaGlzWWVhciA9IHRoaXNZZWFyVHJhbnNhY3Rpb25zLnJlZHVjZSgoc3VtLCB0KSA9PiBzdW0gKyB0LmFtb3VudCwgMCk7XG4gICAgY29uc3QgdG90YWxMYXN0WWVhciA9IGxhc3RZZWFyVHJhbnNhY3Rpb25zLnJlZHVjZSgoc3VtLCB0KSA9PiBzdW0gKyB0LmFtb3VudCwgMCk7XG4gICAgY29uc3QgdG90YWxUaGlzTW9udGggPSB0aGlzTW9udGhUcmFuc2FjdGlvbnMucmVkdWNlKChzdW0sIHQpID0+IHN1bSArIHQuYW1vdW50LCAwKTtcbiAgICBjb25zdCB0b3RhbExhc3RNb250aCA9IGxhc3RNb250aFRyYW5zYWN0aW9ucy5yZWR1Y2UoKHN1bSwgdCkgPT4gc3VtICsgdC5hbW91bnQsIDApO1xuICAgIGNvbnN0IHRvdGFsVG9kYXkgPSB0b2RheVRyYW5zYWN0aW9ucy5yZWR1Y2UoKHN1bSwgdCkgPT4gc3VtICsgdC5hbW91bnQsIDApO1xuICAgIGNvbnN0IHRvdGFsWWVzdGVyZGF5ID0geWVzdGVyZGF5VHJhbnNhY3Rpb25zLnJlZHVjZSgoc3VtLCB0KSA9PiBzdW0gKyB0LmFtb3VudCwgMCk7XG4gICAgY29uc3QgYXZlcmFnZVRyYW5zYWN0aW9uID0gdG90YWxUaGlzWWVhciAvIHRoaXNZZWFyVHJhbnNhY3Rpb25zLmxlbmd0aCB8fCAwO1xuICAgIGNvbnN0IGF2ZXJhZ2VUcmFuc2FjdGlvbkxhc3RXZWVrID0gbGFzdFdlZWtUcmFuc2FjdGlvbnMucmVkdWNlKChzdW0sIHQpID0+IHN1bSArIHQuYW1vdW50LCAwKSAvIGxhc3RXZWVrVHJhbnNhY3Rpb25zLmxlbmd0aCB8fCAwO1xuXG4gICAgc2V0TWV0cmljcyh7XG4gICAgICB0b3RhbFRoaXNZZWFyLFxuICAgICAgdG90YWxMYXN0WWVhcixcbiAgICAgIHRvdGFsVGhpc01vbnRoLFxuICAgICAgdG90YWxMYXN0TW9udGgsXG4gICAgICB0b3RhbFRvZGF5LFxuICAgICAgdG90YWxZZXN0ZXJkYXksXG4gICAgICBhdmVyYWdlVHJhbnNhY3Rpb24sXG4gICAgICBhdmVyYWdlVHJhbnNhY3Rpb25MYXN0V2VlayxcbiAgICB9KTtcbiAgfTtcblxuICBjb25zdCBhZGRUcmFuc2FjdGlvbiA9IGFzeW5jICh0cmFuc2FjdGlvbjogT21pdDxUcmFuc2FjdGlvbiwgJ2lkJyB8ICdkYXRlJyB8ICdjcmVhdGVkQnknPikgPT4ge1xuICAgIGlmICghdXNlcikgdGhyb3cgbmV3IEVycm9yKCdVc2VyIG5vdCBhdXRoZW50aWNhdGVkJyk7XG5cbiAgICBjb25zdCBuZXdUcmFuc2FjdGlvbiA9IHtcbiAgICAgIC4uLnRyYW5zYWN0aW9uLFxuICAgICAgY3JlYXRlZEJ5OiB1c2VyLnVpZCxcbiAgICAgIGRhdGU6IFRpbWVzdGFtcC5ub3coKSxcbiAgICB9O1xuXG4gICAgaWYgKHVzZXIucm9sZSA9PT0gJ2FkbWluJykge1xuICAgICAgbmV3VHJhbnNhY3Rpb24uYWRtaW5JZCA9IHVzZXIudWlkO1xuICAgIH0gZWxzZSBpZiAodXNlci5yb2xlID09PSAnZW1wbG95ZWUnKSB7XG4gICAgICAvLyBGb3IgZW1wbG95ZWVzLCB3ZSBuZWVkIHRvIGZldGNoIHRoZWlyIGFkbWluJ3MgSURcbiAgICAgIGNvbnN0IHVzZXJEb2MgPSBhd2FpdCBnZXREb2MoZG9jKGRiLCAndXNlcnMnLCB1c2VyLnVpZCkpO1xuICAgICAgY29uc3QgdXNlckRhdGEgPSB1c2VyRG9jLmRhdGEoKTtcbiAgICAgIGlmICh1c2VyRGF0YSAmJiB1c2VyRGF0YS5hZG1pbklkKSB7XG4gICAgICAgIG5ld1RyYW5zYWN0aW9uLmFkbWluSWQgPSB1c2VyRGF0YS5hZG1pbklkO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdFbXBsb3llZSBpcyBub3QgYXNzb2NpYXRlZCB3aXRoIGFuIGFkbWluJyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgYXdhaXQgYWRkRG9jKGNvbGxlY3Rpb24oZGIsICd0cmFuc2FjdGlvbnMnKSwgbmV3VHJhbnNhY3Rpb24pO1xuICB9O1xuXG4gIGNvbnN0IGRlbGV0ZVRyYW5zYWN0aW9uID0gYXN5bmMgKGlkOiBzdHJpbmcpID0+IHtcbiAgICBpZiAoIXVzZXIpIHRocm93IG5ldyBFcnJvcignVXNlciBub3QgYXV0aGVudGljYXRlZCcpO1xuICAgIGlmICh1c2VyLnJvbGUgIT09ICdhZG1pbicpIHRocm93IG5ldyBFcnJvcignVW5hdXRob3JpemVkJyk7XG5cbiAgICBhd2FpdCBkZWxldGVEb2MoZG9jKGRiLCAndHJhbnNhY3Rpb25zJywgaWQpKTtcbiAgfTtcblxuICBjb25zdCBkZWxldGVBbGxUcmFuc2FjdGlvbnMgPSBhc3luYyAoKSA9PiB7XG4gICAgaWYgKCF1c2VyKSB0aHJvdyBuZXcgRXJyb3IoJ1VzZXIgbm90IGF1dGhlbnRpY2F0ZWQnKTtcblxuICAgIGNvbnN0IHEgPSBxdWVyeShjb2xsZWN0aW9uKGRiLCAndHJhbnNhY3Rpb25zJyksIHdoZXJlKCd1c2VySWQnLCAnPT0nLCB1c2VyLnVpZCkpO1xuICAgIGNvbnN0IHF1ZXJ5U25hcHNob3QgPSBhd2FpdCBnZXREb2NzKHEpO1xuICAgIFxuICAgIGNvbnN0IGJhdGNoID0gd3JpdGVCYXRjaChkYik7XG4gICAgcXVlcnlTbmFwc2hvdC5mb3JFYWNoKChkb2MpID0+IHtcbiAgICAgIGJhdGNoLmRlbGV0ZShkb2MucmVmKTtcbiAgICB9KTtcblxuICAgIGF3YWl0IGJhdGNoLmNvbW1pdCgpO1xuICB9O1xuXG4gIHJldHVybiB7IHRyYW5zYWN0aW9ucywgYWRkVHJhbnNhY3Rpb24sIGRlbGV0ZVRyYW5zYWN0aW9uLCBkZWxldGVBbGxUcmFuc2FjdGlvbnMsIG1ldHJpY3MgfTtcbn0iXSwibmFtZXMiOlsidXNlU3RhdGUiLCJ1c2VFZmZlY3QiLCJjb2xsZWN0aW9uIiwicXVlcnkiLCJ3aGVyZSIsIm9uU25hcHNob3QiLCJhZGREb2MiLCJkZWxldGVEb2MiLCJkb2MiLCJUaW1lc3RhbXAiLCJkYiIsInVzZUF1dGgiLCJnZXREb2NzIiwid3JpdGVCYXRjaCIsInVzZVRyYW5zYWN0aW9ucyIsInRyYW5zYWN0aW9ucyIsInNldFRyYW5zYWN0aW9ucyIsIm1ldHJpY3MiLCJzZXRNZXRyaWNzIiwidG90YWxUaGlzWWVhciIsInRvdGFsTGFzdFllYXIiLCJ0b3RhbFRoaXNNb250aCIsInRvdGFsTGFzdE1vbnRoIiwidG90YWxUb2RheSIsInRvdGFsWWVzdGVyZGF5IiwiYXZlcmFnZVRyYW5zYWN0aW9uIiwiYXZlcmFnZVRyYW5zYWN0aW9uTGFzdFdlZWsiLCJ1c2VyIiwidW5zdWJzY3JpYmUiLCJmZXRjaFRyYW5zYWN0aW9ucyIsInEiLCJyb2xlIiwidWlkIiwicXVlcnlTbmFwc2hvdCIsInRyYW5zYWN0aW9uc0RhdGEiLCJmb3JFYWNoIiwiZGF0YSIsInB1c2giLCJpZCIsImFtb3VudCIsImN1c3RvbWVyTmFtZSIsIm5vdGVzIiwiZGF0ZSIsInRvRGF0ZSIsImNyZWF0ZWRCeSIsImNhbGN1bGF0ZU1ldHJpY3MiLCJub3ciLCJEYXRlIiwidGhpc1llYXIiLCJnZXRGdWxsWWVhciIsInRoaXNNb250aCIsImdldE1vbnRoIiwidG9kYXkiLCJnZXREYXRlIiwidGhpc1llYXJUcmFuc2FjdGlvbnMiLCJmaWx0ZXIiLCJ0IiwibGFzdFllYXJUcmFuc2FjdGlvbnMiLCJ0aGlzTW9udGhUcmFuc2FjdGlvbnMiLCJsYXN0TW9udGhUcmFuc2FjdGlvbnMiLCJ0b2RheVRyYW5zYWN0aW9ucyIsInllc3RlcmRheVRyYW5zYWN0aW9ucyIsIm9uZVdlZWtBZ28iLCJnZXRUaW1lIiwibGFzdFdlZWtUcmFuc2FjdGlvbnMiLCJyZWR1Y2UiLCJzdW0iLCJsZW5ndGgiLCJhZGRUcmFuc2FjdGlvbiIsInRyYW5zYWN0aW9uIiwiRXJyb3IiLCJuZXdUcmFuc2FjdGlvbiIsImFkbWluSWQiLCJ1c2VyRG9jIiwiZ2V0RG9jIiwidXNlckRhdGEiLCJkZWxldGVUcmFuc2FjdGlvbiIsImRlbGV0ZUFsbFRyYW5zYWN0aW9ucyIsImJhdGNoIiwiZGVsZXRlIiwicmVmIiwiY29tbWl0Il0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(app-pages-browser)/./hooks/useTransactions.ts\n"));

/***/ })

});