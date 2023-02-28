Rails.application.routes.draw do
  # API
  namespace :api do 
    namespace :v1 do
      resources :games, :players, only: [:index, :create]
    end
  end
end
