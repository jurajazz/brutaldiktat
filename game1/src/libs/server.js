import * as COOKIES from './cookies'

var user_profile_data_json = '' // will be filled by HTTP get request later
var user_profile_received = false
export function is_user_profile_received()
{
	return user_profile_received
}
export function get_user_profile()
{
	//user_profile_data_json='{"nickname":"","sentences":{"count":2,"hashes":["53e4b79af4af5","2ce4327320966"]}}'
	// user_profile_data_json = 'incorrect-data'
	try
	{
		var data = JSON.parse(user_profile_data_json)
		return data
	}
	catch (error)
	{
		console.log("Server response error ("+error+") parsing response:"+user_profile_data_json)
	}
}

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

export function post(action,data,hash)
{
	var xhr = new XMLHttpRequest();
	var server_url = "https://ypsilon.sk/brutaldiktat/stat.php"
	// var server_url = "http://localhost:8080/stat.php"
	xhr.open("POST", server_url, true);
	xhr.setRequestHeader('Content-Type', 'application/json');
	data['action'] = action
	data['user_id'] = get_user_id()
	data['hash'] = hash
	xhr.send(JSON.stringify(data));
}

// posle poziadavku na server a ked je vibavena, tak cez get_user_profile vycita data
export function send_request_for_user_profile_from_server()
{
	var xhr = new XMLHttpRequest();
	var server_url = "https://ypsilon.sk/brutaldiktat/stat.php?action=get_user_profile&user_id="+get_user_id()
	xhr.onreadystatechange = function()
	{
		if (this.readyState == 4 && this.status == 200)
		{
			// Typical action to be performed when the document is ready:
			user_profile_data_json = xhr.responseText
			console.log("UserProfile:"+user_profile_data_json)
			user_profile_received = true
		}
	};
	xhr.open("GET", server_url, true)
	xhr.send()
}
