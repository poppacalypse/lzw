class Api::V1::PlayersController < ApplicationController 
  def index
    players = Player.all 
    render json: players
  end

  def create
    player = Player.find_or_create_by(username: params[:username].upcase)
    render json: player
  end
end
