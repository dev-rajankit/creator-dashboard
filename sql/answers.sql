/*
ASSUMPTIONS:

1. A creator is considered "active" if they have at least one subscription
   with status = 'active'.

2. Revenue is calculated ONLY from active subscriptions.

3. If a creator has multiple active subscriptions, revenue is summed.

4. For revenue_per_1000_views:
   - Creators with zero total views are excluded to avoid division by zero.

5. All queries are written for MSSQL (SQL Server).
*/

---------------------------------------------------
-- Q1 — Posts per creator
---------------------------------------------------
-- Count total posts per creator.
-- LEFT JOIN ensures creators with zero posts are included.

SELECT
    c.name AS creator_name,
    COUNT(p.id) AS total_posts
FROM creators c
LEFT JOIN posts p ON p.creator_id = c.id
GROUP BY c.id, c.name
ORDER BY total_posts DESC;

---------------------------------------------------
-- Q2 — Current active revenue per creator
---------------------------------------------------
-- Sum plan_price from active subscriptions only.

SELECT
    c.name AS creator_name,
    COALESCE(SUM(s.plan_price), 0) AS current_revenue
FROM creators c
LEFT JOIN subscriptions s
    ON s.creator_id = c.id
   AND s.status = 'active'
GROUP BY c.id, c.name
ORDER BY current_revenue DESC;

---------------------------------------------------
-- Q3 — January 2025 cohort conversion
---------------------------------------------------
-- Deduplicate creators using COUNT(DISTINCT).
-- Active creator = at least one active subscription.

SELECT
    c.signup_date,
    COUNT(DISTINCT c.id) AS creators_signed,
    COUNT(DISTINCT CASE WHEN s.status = 'active' THEN c.id END) AS creators_with_active_subscription,
    CAST(COUNT(DISTINCT CASE WHEN s.status = 'active' THEN c.id END) AS FLOAT)
        / NULLIF(COUNT(DISTINCT c.id), 0) AS conversion_rate
FROM creators c
LEFT JOIN subscriptions s ON s.creator_id = c.id
WHERE c.signup_date >= '2025-01-01'
  AND c.signup_date < '2025-02-01'
GROUP BY c.signup_date
ORDER BY c.signup_date;

---------------------------------------------------
-- Q4 — Revenue efficiency metric (Top 3 creators)
---------------------------------------------------
-- Revenue = sum of active subscriptions
-- Views = sum of all post views
-- Exclude creators with zero views

WITH revenue_cte AS (
    SELECT
        creator_id,
        SUM(plan_price) AS revenue
    FROM subscriptions
    WHERE status = 'active'
    GROUP BY creator_id
),
views_cte AS (
    SELECT
        creator_id,
        SUM(views) AS views
    FROM posts
    GROUP BY creator_id
)

SELECT TOP 3
    c.name AS creator_name,
    r.revenue,
    v.views,
    r.revenue / NULLIF((CAST(v.views AS FLOAT) / 1000), 0) AS revenue_per_1000_views
FROM creators c
JOIN revenue_cte r ON r.creator_id = c.id
JOIN views_cte v ON v.creator_id = c.id
WHERE v.views > 0
ORDER BY revenue_per_1000_views DESC;

---------------------------------------------------
-- BONUS — Index Suggestions
---------------------------------------------------

-- Speed up January cohort filtering
CREATE INDEX idx_creators_signup_date ON creators(signup_date);

-- Speed up active subscription lookups
CREATE INDEX idx_subscriptions_creator_status
ON subscriptions(creator_id, status);

-- Speed up post aggregation
CREATE INDEX idx_posts_creator
ON posts(creator_id);
