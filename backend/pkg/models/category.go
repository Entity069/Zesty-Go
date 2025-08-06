package models

type Category struct {
	ID          int    `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
}

func (c *Category) Create() error {
	query := `INSERT INTO categories (name, description) VALUES (?, ?)`

	result, err := DB.Exec(query, c.Name, c.Description)
	if err != nil {
		return err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return err
	}
	c.ID = int(id)
	return nil
}

func (c *Category) Update() error {
	query := `UPDATE categories SET name = ?, description = ? WHERE id = ?`
	_, err := DB.Exec(query, c.Name, c.Description, c.ID)
	return err
}

func (c *Category) UpdateName(name string) error {
	query := `UPDATE categories SET name = ? WHERE id = ?`
	_, err := DB.Exec(query, name, c.ID)
	if err == nil {
		c.Name = name
	}
	return err
}

func (c *Category) UpdateDescription(description string) error {
	query := `UPDATE categories SET description = ? WHERE id = ?`
	_, err := DB.Exec(query, description, c.ID)
	if err == nil {
		c.Description = description
	}
	return err
}

func (c *Category) Delete() error {
	query := `DELETE FROM categories WHERE id = ?`
	_, err := DB.Exec(query, c.ID)
	return err
}

func GetCategoryByID(id int) (*Category, error) {
	category := &Category{}
	query := `SELECT id, name, description FROM categories WHERE id = ?`

	err := DB.QueryRow(query, id).Scan(&category.ID, &category.Name, &category.Description)
	if err != nil {
		return nil, err
	}
	return category, nil
}

func GetCategoryByName(name string) (*Category, error) {
	category := &Category{}
	query := `SELECT id, name, description FROM categories WHERE name = ?`

	err := DB.QueryRow(query, name).Scan(&category.ID, &category.Name, &category.Description)
	if err != nil {
		return nil, err
	}
	return category, nil
}

func GetAllCategories() ([]*Category, error) {
	query := `SELECT id, name, description FROM categories ORDER BY name`

	rows, err := DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var categories []*Category
	for rows.Next() {
		category := &Category{}
		err := rows.Scan(&category.ID, &category.Name, &category.Description)
		if err != nil {
			return nil, err
		}
		categories = append(categories, category)
	}
	return categories, nil
}
