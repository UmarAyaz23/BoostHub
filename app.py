from flask import Flask, request, jsonify, render_template
import oracledb

app = Flask(__name__)


dsn = oracledb.makedsn('localhost', '1521', 'orcl')
connection = oracledb.connect(user='system', password='Uit54321', dsn=dsn)

def query_db(query, args=(), one=False):
    with connection.cursor() as cursor:
        cursor.execute(query, args)
        rows = cursor.fetchall()
        columns = [col[0] for col in cursor.description]
        result = [dict(zip(columns, row)) for row in rows]
        return (result[0] if result else None) if one else result

def modify_db(query, args=()):
    with connection.cursor() as cursor:
        cursor.execute(query, args)
        connection.commit()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/alter')
def alter():
    return render_template('alter.html')

@app.route('/get_table/<table_name>')
def get_table(table_name):
    query = f'SELECT * FROM {table_name}'
    rows = query_db(query)
    return jsonify(rows)

@app.route('/get_columns/<table_name>')
def get_columns(table_name):
    query = f'''
        SELECT column_name
        FROM user_tab_columns
        WHERE table_name = :1
        ORDER BY column_id
    '''
    columns = query_db(query, [table_name.upper()])
    column_names = [col['COLUMN_NAME'] for col in columns]
    return jsonify(column_names)

@app.route('/insert', methods=['POST'])
def insert():
    data = request.json
    table_name = data.pop('table_name')
    columns = ', '.join(data.keys())
    placeholders = ', '.join([f':{i+1}' for i in range(len(data))])
    values = list(data.values())
    query = f'INSERT INTO {table_name} ({columns}) VALUES ({placeholders})'
    modify_db(query, values)
    return jsonify({'message': 'Insert successful'})

@app.route('/update', methods=['POST'])
def update():
    data = request.json
    table_name = data.pop('table_name')
    primary_key = data.pop('primary_key')  # Assuming primary key is sent separately
    primary_value = data.pop('primary_value')  # Value of primary key
    set_clause = ', '.join([f"{key} = :{i+1}" for i, key in enumerate(data.keys())])
    values = list(data.values()) + [primary_value]
    query = f'UPDATE {table_name} SET {set_clause} WHERE {primary_key} = :{len(data) + 1}'
    modify_db(query, values)
    return jsonify({'message': 'Update successful'})

@app.route('/delete', methods=['POST'])
def delete():
    data = request.json
    table_name = data['table_name']
    primary_key = data['primary_key']
    primary_value = data['primary_value']
    query = f'DELETE FROM {table_name} WHERE {primary_key} = :1'
    modify_db(query, [primary_value])
    return jsonify({'message': 'Delete successful'})

if __name__ == '__main__':
    app.run(debug=True)