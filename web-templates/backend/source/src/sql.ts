export const getSubdivisionsByQueryAndChild = (query: string) => `
WITH subdivision_hierarchy AS (
    -- Базовый случай: находим все подразделения с указанной подстрокой
    SELECT 
        id,
        name,
        parent_object_id,
        0 as level
    FROM subdivisions 
    WHERE name LIKE '%${query}%'  -- ЗАМЕНИТЕ на вашу подстроку
    
    UNION ALL
    
    -- Рекурсивный случай: находим всех потомков
    SELECT 
        child.id,
        child.name,
        child.parent_object_id,
        parent.level + 1 as level
    FROM subdivisions child
     INNER JOIN subdivision_hierarchy parent ON child.parent_object_id = parent.id
)
SELECT DISTINCT
    id,
    name, 
    parent_object_id,
    level
FROM subdivision_hierarchy
ORDER BY 
    name`;
