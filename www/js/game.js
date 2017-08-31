function gameSetup(){
	myApp.onPageInit('gamelist', function(page){
	});
	myApp.onPageInit('mancala', function(page){
		var currentPlayer = 'One';
		var turn = 1;
		var player1Mancala = 0;
		var player2Mancala = 0;

		$$('.mancala-information').prepend('<p> Player One\'s Turn.</p>');

		$$('.mancala-pit').on('click', function(){
			var playerPit	= $$(this).data('player');
			var pitId		= parseInt($$(this).data('pit'));
			var gemstones	= parseInt($$(this).data('gemstones'));
			if(isNaN(pitId)){ }
			if(isNaN(gemstones)){ }
			if(playerPit == currentPlayer){
				if(gemstones > 0){
					$$(this).attr('data-gemstones', '0');
					if(pitId-1 == 0){
						gemstones--;
						player1Mancala++;
						$$('.mancala-hole.player1 > div > .manc-score-symb').attr('data-gemstones', player1Mancala);
						$$('.mancala-hole.player1 > div > .manc-score-num').text(player1Mancala);
					} else if(pitId-1 == 6){
						gemstones--;
						player2Mancala++;
						$$('.mancala-hole.player2 > div > .manc-score-symb').attr('data-gemstones', player2Mancala);
						$$('.mancala-hole.player2 > div > .manc-score-num').text(player2Mancala);
					}
					moveGems((pitId - 1 == 0 ? 12 : pitId - 1), gemstones, playerPit);
				} else {
					toast('No Stones', SHORT);	
				}
			} else {
				toast('Wrong Side', SHORT);
			}
		});

		function moveGems(startingPosition, gemstones, player){
			var extraTurn = false;
			if(gemstones > 0){
				var gemstonesInPit = parseInt($$('.mancala-pit[data-pit="'+startingPosition+'"]').data('gemstones'));
				var pitPlayer = $$('.mancala-pit[data-pit="'+startingPosition+'"]').data('player');
				var gemstonesPlusOne = gemstonesInPit+1;
				gemstones--; //lower gems in hand
				$$('.mancala-pit[data-pit="'+startingPosition+'"]').attr('data-gemstones', gemstonesPlusOne);

				if(startingPosition == 1 && gemstones >= 1 && player == 'One'){ // if you have gemstones left and you're right before your mancala
					player1Mancala++;
					gemstones--;
					$$('.mancala-hole.player1 > div > .manc-score-symb').attr('data-gemstones', player1Mancala);
					$$('.mancala-hole.player1 > div > .manc-score-num').text(player1Mancala);
					extraTurn = (gemstones == 0 ? true : false);
					// if no gemstones left, go again
				} else if(startingPosition == 7 && gemstones >= 1 && player == 'Two'){ // if you have gemstones left and you're right player 2's mancala
					player2Mancala++;
					gemstones--;
					$$('.mancala-hole.player2 > div > .manc-score-symb').attr('data-gemstones', player2Mancala);
					$$('.mancala-hole.player2 > div > .manc-score-num').text(player2Mancala);
					extraTurn = (gemstones == 0 ? true : false);
					// if no gemstones left, go again
				}

				if(gemstones > 0){
					startingPosition--;
					moveGems((startingPosition == 0 ? 12 : startingPosition), gemstones, player);
				} else { //no stones left -- decide on the next turn
					if(gemstonesPlusOne == 1 && !extraTurn && pitPlayer == currentPlayer){
						var gemsToSteal = parseInt($$('.mancala-pit[data-pit="'+(13-startingPosition)+'"]').data('gemstones'));
						if(gemsToSteal > 0){
							$$('.mancala-pit[data-pit="'+startingPosition+'"]').attr('data-gemstones', '0');
							$$('.mancala-pit[data-pit="'+(13-startingPosition)+'"]').attr('data-gemstones', '0');
							gemsToSteal++;
							if(currentPlayer == 'One'){
								player1Mancala+=gemsToSteal; //add 1 for the gem you put into the empty cup to steal the others
								$$('.mancala-hole.player1 > div > .manc-score-symb').attr('data-gemstones', player1Mancala);
								$$('.mancala-hole.player1 > div > .manc-score-num').text(player1Mancala);
							} else if(currentPlayer == 'Two'){
								player2Mancala+=gemsToSteal;
								$$('.mancala-hole.player2 > div > .manc-score-symb').attr('data-gemstones', player2Mancala);
								$$('.mancala-hole.player2 > div > .manc-score-num').text(player2Mancala);
							}
						}
					}
					var currentPlayerOpp = (currentPlayer == 'One' ? 'Two' : 'One');
					currentPlayer = (extraTurn ? currentPlayer : currentPlayerOpp)
					$$('.mancala-information').prepend('<p> Player '+currentPlayer+'\'s Turn.</p>');
					checkWinner();
				}
			}
		}

		function checkWinner(){
			//silence
		}
	});

	myApp.onPageInit('gametwo', function(){
		var counter = 0;
		function onSuccess(acceleration) {
			counter++;
			console.log(counter);
	    	console.log('Acceleration X: ' + acceleration.x + '\n' +
	        	'Acceleration Y: ' + acceleration.y + '\n' +
	        	'Acceleration Z: ' + acceleration.z + '\n' +
	        	'Timestamp: '      + acceleration.timestamp + '\n');
	    	if(counter == 10){
				navigator.accelerometer.clearWatch(watchID);
			}
		}

		function onError() {
	    	alert('onError!');
		}

		var options = { frequency: 3000 };  // Update every 3 seconds

		var watchID = navigator.accelerometer.watchAcceleration(onSuccess, onError, options);
	});
}