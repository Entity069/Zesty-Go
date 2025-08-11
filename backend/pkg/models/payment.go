package models

type Payment struct {
	ID       int     `json:"id"`
	PayeeID  int     `json:"payee_id"`
	OrderID  int     `json:"order_id"`
	Amount   float64 `json:"amount"`
	Discount float64 `json:"discount"`
	IsPaid   bool    `json:"is_paid"`
}

func (p *Payment) Create() error {
	query := `INSERT INTO payments (payee_id, order_id, amount, discount, is_paid) VALUES (?, ?, ?, ?, ?)`

	result, err := DB.Exec(query, p.PayeeID, p.OrderID, p.Amount, p.Discount, p.IsPaid)
	if err != nil {
		return err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return err
	}
	p.ID = int(id)
	return nil
}

func (p *Payment) Update() error {
	query := `UPDATE payments SET payee_id = ?, amount = ?, discount = ?, is_paid = ? WHERE id = ?`
	_, err := DB.Exec(query, p.PayeeID, p.Amount, p.Discount, p.IsPaid, p.ID)
	return err
}

func (p *Payment) MarkAsPaid() error {
	query := `UPDATE payments SET is_paid = true WHERE id = ?`
	_, err := DB.Exec(query, p.ID)
	if err == nil {
		p.IsPaid = true
	}
	return err
}

func (p *Payment) MarkAsUnpaid() error {
	query := `UPDATE payments SET is_paid = false WHERE id = ?`
	_, err := DB.Exec(query, p.ID)
	if err == nil {
		p.IsPaid = false
	}
	return err
}

func (p *Payment) UpdateAmount(amount float64) error {
	query := `UPDATE payments SET amount = ? WHERE id = ?`
	_, err := DB.Exec(query, amount, p.ID)
	if err == nil {
		p.Amount = amount
	}
	return err
}
func (p *Payment) Delete() error {
	query := `DELETE FROM payments WHERE id = ?`
	_, err := DB.Exec(query, p.ID)
	return err
}

func (p *Payment) GetFinalAmt() float64 {
	if p.Discount != 0 {
		return p.Amount - p.Discount
	}
	return p.Amount
}

func GetPaymentByID(id int) (*Payment, error) {
	payment := &Payment{}
	query := `SELECT id, payee_id, order_id, amount, discount, is_paid FROM payments WHERE id = ?`

	err := DB.QueryRow(query, id).Scan(&payment.ID, &payment.PayeeID, &payment.OrderID, &payment.Amount, &payment.Discount, &payment.IsPaid)
	if err != nil {
		return nil, err
	}
	return payment, nil
}

func GetPaymentByOrderID(orderID int) (*Payment, error) {
	payment := &Payment{}
	query := `SELECT id, payee_id, order_id, amount, discount, is_paid FROM payments WHERE order_id = ?`

	err := DB.QueryRow(query, orderID).Scan(&payment.ID, &payment.PayeeID, &payment.OrderID, &payment.Amount, &payment.Discount, &payment.IsPaid)
	if err != nil {
		return nil, err
	}
	return payment, nil
}

func GetAllPayments() ([]*Payment, error) {
	query := `SELECT id, payee_id, order_id, amount, discount, is_paid FROM payments ORDER BY id DESC`

	rows, err := DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var payments []*Payment
	for rows.Next() {
		payment := &Payment{}
		err := rows.Scan(&payment.ID, &payment.PayeeID, &payment.OrderID, &payment.Amount, &payment.Discount, &payment.IsPaid)
		if err != nil {
			return nil, err
		}
		payments = append(payments, payment)
	}
	return payments, nil
}
