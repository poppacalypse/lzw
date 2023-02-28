class Game < ApplicationRecord
  belongs_to :player

  scope :top_five, -> { order("score desc").limit(5) }
end
