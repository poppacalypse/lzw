class Api::V1::GamesController < ApplicationController 
  def index
    top_scores = Game.top_five
    render json: top_scores, only: [:score], include: { player: { only: [:id, :username] }}
  end

  def create
    begin
      # find player with username passed in params 
      player = Player.find_by(username: params[:username].upcase)
      new_score = params[:score]

      # find game of said player 
      game = Game.find_by(player_id: player.id) 
      # game = player.game # also acceptable - but did not work...

      if game 
        # update with new score if > current score 
        if game.score < new_score
          game.score = new_score
          game.save
        end
      else
        # create a new game
        Game.create(player_id: player.id, score: new_score)
      end

      top_scores = Game.top_five
      render json: top_scores, only: [:score], include: { player: { only: [:id, :username] }}

    rescue Exception 
      render json: { message: "Cannot save the game" }, status: 400
    end
  end
end