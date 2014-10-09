function getPermission() {

	
	//Get Permissions
	FB.api('/me/permissions', function (response) {
		if(!response) {
			alert('Error occured.');
		} else if (response.error) {
			console.log(response.error);
		} else {
			//Show Update button
			$('#permSubmit').show();
		
			// Clear DIV content
			$('#permissions').html( ' ' );
			
			var userPerms = Object.keys(response.data).length
			//Creates the permission settings
			
			for(var i=1; i<userPerms; i++) {
				var userPerm = response.data[i].permission;
				var userPermStatus = response.data[i].status;

				$('#permissions').append( '<div class="fields" id="perm'+ i +'">\n\
				 <div style="display: inline-block; width:50%; text-align: right;"><label>' + userPerm +'</label> Permission:</div>\n\
					<select id="dropperm'+ i +'">\n\
					<option value="0">'+ userPermStatus + '</option>\n\
							<option value="1">Re-authenticate</option>\n\
							<option value="2">Revoke</option>\n\
							<option value="3">No Change</option>\n\
						</div>\n\
					</select>\n\
				  </div><br>\n\
				');

			}
			
			$('.dropdown').dropdown();
		}
	});

}

function permUpdate() {
	var i = 1;
	
	while (label != "") {
		var label = $('#perm' + i + ' label').text();
		var resp = $('#dropperm' + i).val();
		
		if (resp == 2) {
			FB.api('/me/permissions/' + label, 
				'delete', function(response) { getPermission();});
		} else if (resp == 1) {
			FB.login(
			  function(response) {
				getPermission();
			  },
			  {
				scope: label,
				auth_type: 'rerequest'
			  }
			);
		}
		i++;
		var label = $('#perm' + i + ' label').text();
	}
	
}

function permRemove() {
	$('.basic.modal').modal('show')
		.modal({ onApprove: function() {
				FB.api('/me/permissions/', 
				'delete', function(response) { location.reload() });
			}
		});
}

