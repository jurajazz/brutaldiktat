import * as COOKIES from './cookies'

export function gen_new_user_id()
{
	var rand_array = new Uint32Array(2)
	crypto.getRandomValues(rand_array)
	var user_id = ((rand_array[0]*(2**30)) + rand_array[1]).toString() // 64bit number
	//console.log('gen_new_user_id:'+user_id)
	return user_id
}

export function get_user_id()
{
	var user_id = COOKIES.get(COOKIES.COOKIE_NAME_USER_ID)
	if (user_id == '')
	{
		user_id = gen_new_user_id()
		COOKIES.set(COOKIES.COOKIE_NAME_USER_ID, user_id, 365)
	}
	//console.log('get_user_id:'+user_id);
	return user_id
}

export function post(data)
{
	var xhr = new XMLHttpRequest();
	var server_url = "https://ypsilon.sk/brutaldiktat/stat.php"
	//var server_url = "http://localhost:8080/stat.php"
	xhr.open("POST", server_url, true);
	xhr.setRequestHeader('Content-Type', 'application/json');
	data['user_id'] = get_user_id()
	xhr.send(JSON.stringify(data));
}
