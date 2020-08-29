const discover = async (body, username, client) => {
    try {
        const { rows: userRows } = await client.query(`SELECT "need", "language" FROM users WHERE username = $1`, [username])

        if (userRows.length !== 1) {
            return {
                statusCode: 400,
                exists: false,
                error: "No user found."
            }
        }

        const user = userRows[0]

        const queryArr = JSON.parse(user.need).map((n, i) => `WHEN offer SIMILAR TO '%"${n}"%' THEN ${i}`)
        const numberPerCategory = 10

        const query = `SELECT rank_score.* FROM
             (SELECT users.username, users.offer, users.name, users.language, users.otherlanguages, users.funfact, users.bio,
                rank() OVER (PARTITION BY
                CASE
                    ${queryArr.join(" ")}
                END
             ORDER BY username DESC)
        FROM users) rank_score
        WHERE rank <= ${numberPerCategory} AND offer IS NOT NULL`.replace(/(\r\n|\n|\r)/gm, " ").replace(/\s+/g, " ")

        const { rows } = await client.query(query)

        client.release()

        return {
            need: JSON.parse(user.need),
            rows: rows
        }
    } catch (e) {
        return {
            statusCode: e.status || 500,
            error: e.message
        }
    }
}

module.exports = { discover }