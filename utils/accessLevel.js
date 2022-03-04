const accessLevels = Object.freeze({
    0 : superadmin,
    1 : admin,
	2 : user
})

const testAccessLevels = Object.freeze({
	0 : administrator,
	1 : guest,
	2 : evaluator
})

const testTypes = Object.freeze({
    heuristics,
	user
})

module.exports = {
    accessLevels,
    testAccessLevels,
    testTypes
}