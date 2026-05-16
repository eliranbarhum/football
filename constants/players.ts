export interface Player {
  id: string;
  name: string;
  displayName: string;
  team: string;
  teamShort: string;
  nationality: string;
  position: 'Forward' | 'Midfielder' | 'Defender' | 'Goalkeeper';
  league: string;
  jerseyNumber: number;
  teamColor: string;
  teamColorSecondary: string;
  searchName: string;
  isFeatured: boolean;
  isPopular: boolean;
}

export const PLAYERS: Player[] = [
  // ===== Real Madrid =====
  { id: '1', name: 'Kylian Mbappe', displayName: 'Mbappe', team: 'Real Madrid', teamShort: 'RMA', nationality: 'France', position: 'Forward', league: 'La Liga', jerseyNumber: 9, teamColor: '#FFFFFF', teamColorSecondary: '#FFD700', searchName: 'Kylian Mbappe', isFeatured: true, isPopular: true },
  { id: '2', name: 'Vinicius Junior', displayName: 'Vini Jr', team: 'Real Madrid', teamShort: 'RMA', nationality: 'Brazil', position: 'Forward', league: 'La Liga', jerseyNumber: 7, teamColor: '#FFFFFF', teamColorSecondary: '#FFD700', searchName: 'Vinicius Junior', isFeatured: true, isPopular: true },
  { id: '3', name: 'Jude Bellingham', displayName: 'Bellingham', team: 'Real Madrid', teamShort: 'RMA', nationality: 'England', position: 'Midfielder', league: 'La Liga', jerseyNumber: 5, teamColor: '#FFFFFF', teamColorSecondary: '#FFD700', searchName: 'Jude Bellingham', isFeatured: true, isPopular: true },
  { id: '4', name: 'Luka Modric', displayName: 'Modric', team: 'Real Madrid', teamShort: 'RMA', nationality: 'Croatia', position: 'Midfielder', league: 'La Liga', jerseyNumber: 10, teamColor: '#FFFFFF', teamColorSecondary: '#FFD700', searchName: 'Luka Modric', isFeatured: false, isPopular: true },
  { id: '5', name: 'Thibaut Courtois', displayName: 'Courtois', team: 'Real Madrid', teamShort: 'RMA', nationality: 'Belgium', position: 'Goalkeeper', league: 'La Liga', jerseyNumber: 1, teamColor: '#FFFFFF', teamColorSecondary: '#FFD700', searchName: 'Thibaut Courtois', isFeatured: false, isPopular: false },
  { id: '6', name: 'Federico Valverde', displayName: 'Valverde', team: 'Real Madrid', teamShort: 'RMA', nationality: 'Uruguay', position: 'Midfielder', league: 'La Liga', jerseyNumber: 15, teamColor: '#FFFFFF', teamColorSecondary: '#FFD700', searchName: 'Federico Valverde', isFeatured: false, isPopular: false },

  // ===== Barcelona =====
  { id: '10', name: 'Lamine Yamal', displayName: 'Yamal', team: 'Barcelona', teamShort: 'BAR', nationality: 'Spain', position: 'Forward', league: 'La Liga', jerseyNumber: 19, teamColor: '#004D98', teamColorSecondary: '#A50044', searchName: 'Lamine Yamal', isFeatured: true, isPopular: true },
  { id: '11', name: 'Pedri', displayName: 'Pedri', team: 'Barcelona', teamShort: 'BAR', nationality: 'Spain', position: 'Midfielder', league: 'La Liga', jerseyNumber: 8, teamColor: '#004D98', teamColorSecondary: '#A50044', searchName: 'Pedri', isFeatured: true, isPopular: true },
  { id: '12', name: 'Gavi', displayName: 'Gavi', team: 'Barcelona', teamShort: 'BAR', nationality: 'Spain', position: 'Midfielder', league: 'La Liga', jerseyNumber: 6, teamColor: '#004D98', teamColorSecondary: '#A50044', searchName: 'Gavi', isFeatured: false, isPopular: true },
  { id: '13', name: 'Robert Lewandowski', displayName: 'Lewandowski', team: 'Barcelona', teamShort: 'BAR', nationality: 'Poland', position: 'Forward', league: 'La Liga', jerseyNumber: 9, teamColor: '#004D98', teamColorSecondary: '#A50044', searchName: 'Robert Lewandowski', isFeatured: false, isPopular: true },
  { id: '14', name: 'Raphinha', displayName: 'Raphinha', team: 'Barcelona', teamShort: 'BAR', nationality: 'Brazil', position: 'Forward', league: 'La Liga', jerseyNumber: 11, teamColor: '#004D98', teamColorSecondary: '#A50044', searchName: 'Raphinha', isFeatured: false, isPopular: true },

  // ===== Manchester City =====
  { id: '20', name: 'Erling Haaland', displayName: 'Haaland', team: 'Manchester City', teamShort: 'MCI', nationality: 'Norway', position: 'Forward', league: 'Premier League', jerseyNumber: 9, teamColor: '#6CABDD', teamColorSecondary: '#FFFFFF', searchName: 'Erling Haaland', isFeatured: true, isPopular: true },
  { id: '21', name: 'Kevin De Bruyne', displayName: 'De Bruyne', team: 'Manchester City', teamShort: 'MCI', nationality: 'Belgium', position: 'Midfielder', league: 'Premier League', jerseyNumber: 17, teamColor: '#6CABDD', teamColorSecondary: '#FFFFFF', searchName: 'Kevin De Bruyne', isFeatured: false, isPopular: true },
  { id: '22', name: 'Phil Foden', displayName: 'Foden', team: 'Manchester City', teamShort: 'MCI', nationality: 'England', position: 'Midfielder', league: 'Premier League', jerseyNumber: 47, teamColor: '#6CABDD', teamColorSecondary: '#FFFFFF', searchName: 'Phil Foden', isFeatured: true, isPopular: true },
  { id: '23', name: 'Rodri', displayName: 'Rodri', team: 'Manchester City', teamShort: 'MCI', nationality: 'Spain', position: 'Midfielder', league: 'Premier League', jerseyNumber: 16, teamColor: '#6CABDD', teamColorSecondary: '#FFFFFF', searchName: 'Rodri', isFeatured: false, isPopular: true },
  { id: '24', name: 'Ederson', displayName: 'Ederson', team: 'Manchester City', teamShort: 'MCI', nationality: 'Brazil', position: 'Goalkeeper', league: 'Premier League', jerseyNumber: 31, teamColor: '#6CABDD', teamColorSecondary: '#FFFFFF', searchName: 'Ederson', isFeatured: false, isPopular: false },

  // ===== Liverpool =====
  { id: '30', name: 'Mohamed Salah', displayName: 'Salah', team: 'Liverpool', teamShort: 'LIV', nationality: 'Egypt', position: 'Forward', league: 'Premier League', jerseyNumber: 11, teamColor: '#C8102E', teamColorSecondary: '#00B2A9', searchName: 'Mohamed Salah', isFeatured: true, isPopular: true },
  { id: '31', name: 'Alisson Becker', displayName: 'Alisson', team: 'Liverpool', teamShort: 'LIV', nationality: 'Brazil', position: 'Goalkeeper', league: 'Premier League', jerseyNumber: 1, teamColor: '#C8102E', teamColorSecondary: '#00B2A9', searchName: 'Alisson Becker', isFeatured: false, isPopular: false },
  { id: '32', name: 'Trent Alexander-Arnold', displayName: 'Trent', team: 'Liverpool', teamShort: 'LIV', nationality: 'England', position: 'Defender', league: 'Premier League', jerseyNumber: 66, teamColor: '#C8102E', teamColorSecondary: '#00B2A9', searchName: 'Trent Alexander-Arnold', isFeatured: false, isPopular: true },
  { id: '33', name: 'Diogo Jota', displayName: 'Jota', team: 'Liverpool', teamShort: 'LIV', nationality: 'Portugal', position: 'Forward', league: 'Premier League', jerseyNumber: 20, teamColor: '#C8102E', teamColorSecondary: '#00B2A9', searchName: 'Diogo Jota', isFeatured: false, isPopular: false },

  // ===== Arsenal =====
  { id: '40', name: 'Bukayo Saka', displayName: 'Saka', team: 'Arsenal', teamShort: 'ARS', nationality: 'England', position: 'Forward', league: 'Premier League', jerseyNumber: 7, teamColor: '#EF0107', teamColorSecondary: '#FFFFFF', searchName: 'Bukayo Saka', isFeatured: true, isPopular: true },
  { id: '41', name: 'Martin Odegaard', displayName: 'Odegaard', team: 'Arsenal', teamShort: 'ARS', nationality: 'Norway', position: 'Midfielder', league: 'Premier League', jerseyNumber: 8, teamColor: '#EF0107', teamColorSecondary: '#FFFFFF', searchName: 'Martin Odegaard', isFeatured: false, isPopular: true },
  { id: '42', name: 'Declan Rice', displayName: 'Rice', team: 'Arsenal', teamShort: 'ARS', nationality: 'England', position: 'Midfielder', league: 'Premier League', jerseyNumber: 41, teamColor: '#EF0107', teamColorSecondary: '#FFFFFF', searchName: 'Declan Rice', isFeatured: false, isPopular: true },
  { id: '43', name: 'Gabriel Martinelli', displayName: 'Martinelli', team: 'Arsenal', teamShort: 'ARS', nationality: 'Brazil', position: 'Forward', league: 'Premier League', jerseyNumber: 11, teamColor: '#EF0107', teamColorSecondary: '#FFFFFF', searchName: 'Gabriel Martinelli', isFeatured: false, isPopular: false },

  // ===== Manchester United =====
  { id: '50', name: 'Marcus Rashford', displayName: 'Rashford', team: 'Manchester United', teamShort: 'MUN', nationality: 'England', position: 'Forward', league: 'Premier League', jerseyNumber: 10, teamColor: '#DA020E', teamColorSecondary: '#FFE500', searchName: 'Marcus Rashford', isFeatured: false, isPopular: true },
  { id: '51', name: 'Bruno Fernandes', displayName: 'Bruno', team: 'Manchester United', teamShort: 'MUN', nationality: 'Portugal', position: 'Midfielder', league: 'Premier League', jerseyNumber: 8, teamColor: '#DA020E', teamColorSecondary: '#FFE500', searchName: 'Bruno Fernandes', isFeatured: false, isPopular: true },
  { id: '52', name: 'Rasmus Hojlund', displayName: 'Hojlund', team: 'Manchester United', teamShort: 'MUN', nationality: 'Denmark', position: 'Forward', league: 'Premier League', jerseyNumber: 11, teamColor: '#DA020E', teamColorSecondary: '#FFE500', searchName: 'Rasmus Hojlund', isFeatured: false, isPopular: false },

  // ===== Tottenham =====
  { id: '60', name: 'Son Heung-min', displayName: 'Son', team: 'Tottenham', teamShort: 'TOT', nationality: 'South Korea', position: 'Forward', league: 'Premier League', jerseyNumber: 7, teamColor: '#132257', teamColorSecondary: '#FFFFFF', searchName: 'Son Heung-min', isFeatured: false, isPopular: true },

  // ===== Chelsea =====
  { id: '61', name: 'Cole Palmer', displayName: 'Palmer', team: 'Chelsea', teamShort: 'CHE', nationality: 'England', position: 'Midfielder', league: 'Premier League', jerseyNumber: 20, teamColor: '#034694', teamColorSecondary: '#FFFFFF', searchName: 'Cole Palmer', isFeatured: true, isPopular: true },
  { id: '62', name: 'Nicolas Jackson', displayName: 'Jackson', team: 'Chelsea', teamShort: 'CHE', nationality: 'Senegal', position: 'Forward', league: 'Premier League', jerseyNumber: 15, teamColor: '#034694', teamColorSecondary: '#FFFFFF', searchName: 'Nicolas Jackson', isFeatured: false, isPopular: false },

  // ===== Bayern Munich =====
  { id: '70', name: 'Harry Kane', displayName: 'Kane', team: 'Bayern Munich', teamShort: 'BAY', nationality: 'England', position: 'Forward', league: 'Bundesliga', jerseyNumber: 9, teamColor: '#DC052D', teamColorSecondary: '#0066B2', searchName: 'Harry Kane', isFeatured: false, isPopular: true },
  { id: '71', name: 'Jamal Musiala', displayName: 'Musiala', team: 'Bayern Munich', teamShort: 'BAY', nationality: 'Germany', position: 'Midfielder', league: 'Bundesliga', jerseyNumber: 42, teamColor: '#DC052D', teamColorSecondary: '#0066B2', searchName: 'Jamal Musiala', isFeatured: true, isPopular: true },
  { id: '72', name: 'Leroy Sane', displayName: 'Sane', team: 'Bayern Munich', teamShort: 'BAY', nationality: 'Germany', position: 'Forward', league: 'Bundesliga', jerseyNumber: 10, teamColor: '#DC052D', teamColorSecondary: '#0066B2', searchName: 'Leroy Sane', isFeatured: false, isPopular: false },
  { id: '73', name: 'Thomas Muller', displayName: 'Muller', team: 'Bayern Munich', teamShort: 'BAY', nationality: 'Germany', position: 'Forward', league: 'Bundesliga', jerseyNumber: 25, teamColor: '#DC052D', teamColorSecondary: '#0066B2', searchName: 'Thomas Muller', isFeatured: false, isPopular: true },

  // ===== Bayer Leverkusen =====
  { id: '80', name: 'Florian Wirtz', displayName: 'Wirtz', team: 'Bayer Leverkusen', teamShort: 'LEV', nationality: 'Germany', position: 'Midfielder', league: 'Bundesliga', jerseyNumber: 10, teamColor: '#E32221', teamColorSecondary: '#000000', searchName: 'Florian Wirtz', isFeatured: true, isPopular: true },
  { id: '81', name: 'Granit Xhaka', displayName: 'Xhaka', team: 'Bayer Leverkusen', teamShort: 'LEV', nationality: 'Switzerland', position: 'Midfielder', league: 'Bundesliga', jerseyNumber: 34, teamColor: '#E32221', teamColorSecondary: '#000000', searchName: 'Granit Xhaka', isFeatured: false, isPopular: false },

  // ===== PSG =====
  { id: '90', name: 'Ousmane Dembele', displayName: 'Dembele', team: 'PSG', teamShort: 'PSG', nationality: 'France', position: 'Forward', league: 'Ligue 1', jerseyNumber: 10, teamColor: '#004170', teamColorSecondary: '#DA291C', searchName: 'Ousmane Dembele', isFeatured: false, isPopular: true },
  { id: '91', name: 'Bradley Barcola', displayName: 'Barcola', team: 'PSG', teamShort: 'PSG', nationality: 'France', position: 'Forward', league: 'Ligue 1', jerseyNumber: 29, teamColor: '#004170', teamColorSecondary: '#DA291C', searchName: 'Bradley Barcola', isFeatured: false, isPopular: false },
  { id: '92', name: 'Vitinha', displayName: 'Vitinha', team: 'PSG', teamShort: 'PSG', nationality: 'Portugal', position: 'Midfielder', league: 'Ligue 1', jerseyNumber: 17, teamColor: '#004170', teamColorSecondary: '#DA291C', searchName: 'Vitinha', isFeatured: false, isPopular: false },

  // ===== AC Milan =====
  { id: '100', name: 'Theo Hernandez', displayName: 'T. Hernandez', team: 'AC Milan', teamShort: 'MIL', nationality: 'France', position: 'Defender', league: 'Serie A', jerseyNumber: 19, teamColor: '#FB090B', teamColorSecondary: '#000000', searchName: 'Theo Hernandez', isFeatured: false, isPopular: false },
  { id: '101', name: 'Rafael Leao', displayName: 'Leao', team: 'AC Milan', teamShort: 'MIL', nationality: 'Portugal', position: 'Forward', league: 'Serie A', jerseyNumber: 10, teamColor: '#FB090B', teamColorSecondary: '#000000', searchName: 'Rafael Leao', isFeatured: false, isPopular: true },

  // ===== Inter Milan =====
  { id: '110', name: 'Lautaro Martinez', displayName: 'Lautaro', team: 'Inter Milan', teamShort: 'INT', nationality: 'Argentina', position: 'Forward', league: 'Serie A', jerseyNumber: 10, teamColor: '#010E80', teamColorSecondary: '#000000', searchName: 'Lautaro Martinez', isFeatured: false, isPopular: true },
  { id: '111', name: 'Marcus Thuram', displayName: 'Thuram', team: 'Inter Milan', teamShort: 'INT', nationality: 'France', position: 'Forward', league: 'Serie A', jerseyNumber: 9, teamColor: '#010E80', teamColorSecondary: '#000000', searchName: 'Marcus Thuram', isFeatured: false, isPopular: false },

  // ===== Juventus =====
  { id: '120', name: 'Dusan Vlahovic', displayName: 'Vlahovic', team: 'Juventus', teamShort: 'JUV', nationality: 'Serbia', position: 'Forward', league: 'Serie A', jerseyNumber: 9, teamColor: '#000000', teamColorSecondary: '#FFFFFF', searchName: 'Dusan Vlahovic', isFeatured: false, isPopular: false },
  { id: '121', name: 'Federico Chiesa', displayName: 'Chiesa', team: 'Liverpool', teamShort: 'LIV', nationality: 'Italy', position: 'Forward', league: 'Premier League', jerseyNumber: 14, teamColor: '#C8102E', teamColorSecondary: '#00B2A9', searchName: 'Federico Chiesa', isFeatured: false, isPopular: false },

  // ===== Saudi League / Legends =====
  { id: '130', name: 'Lionel Messi', displayName: 'Messi', team: 'Inter Miami', teamShort: 'MIA', nationality: 'Argentina', position: 'Forward', league: 'MLS', jerseyNumber: 10, teamColor: '#FF007F', teamColorSecondary: '#000000', searchName: 'Lionel Messi', isFeatured: true, isPopular: true },
  { id: '131', name: 'Cristiano Ronaldo', displayName: 'Ronaldo', team: 'Al Nassr', teamShort: 'ALN', nationality: 'Portugal', position: 'Forward', league: 'Saudi Pro League', jerseyNumber: 7, teamColor: '#F5C518', teamColorSecondary: '#003DA5', searchName: 'Cristiano Ronaldo', isFeatured: true, isPopular: true },
  { id: '132', name: 'Neymar Jr', displayName: 'Neymar', team: 'Al Hilal', teamShort: 'ALH', nationality: 'Brazil', position: 'Forward', league: 'Saudi Pro League', jerseyNumber: 10, teamColor: '#0038A8', teamColorSecondary: '#FFD700', searchName: 'Neymar', isFeatured: false, isPopular: true },
  { id: '133', name: 'Karim Benzema', displayName: 'Benzema', team: 'Al Ittihad', teamShort: 'ITT', nationality: 'France', position: 'Forward', league: 'Saudi Pro League', jerseyNumber: 9, teamColor: '#F7C61E', teamColorSecondary: '#000000', searchName: 'Karim Benzema', isFeatured: false, isPopular: true },
  { id: '134', name: 'Victor Osimhen', displayName: 'Osimhen', team: 'Galatasaray', teamShort: 'GAL', nationality: 'Nigeria', position: 'Forward', league: 'Super Lig', jerseyNumber: 9, teamColor: '#E30A17', teamColorSecondary: '#F5B400', searchName: 'Victor Osimhen', isFeatured: false, isPopular: true },

  // ===== ישראל — שחקנים =====
  { id: '200', name: 'Liel Abada', displayName: 'Abada', team: 'Charlotte FC', teamShort: 'CLT', nationality: 'Israel', position: 'Forward', league: 'MLS', jerseyNumber: 11, teamColor: '#1A85C8', teamColorSecondary: '#D0A82E', searchName: 'Liel Abada', isFeatured: true, isPopular: true },
  { id: '201', name: 'Manor Solomon', displayName: 'Solomon', team: 'Fulham', teamShort: 'FUL', nationality: 'Israel', position: 'Forward', league: 'Premier League', jerseyNumber: 17, teamColor: '#CC0000', teamColorSecondary: '#000000', searchName: 'Manor Solomon', isFeatured: true, isPopular: true },
  { id: '202', name: 'Oscar Gloukh', displayName: 'Gloukh', team: 'RB Leipzig', teamShort: 'RBL', nationality: 'Israel', position: 'Midfielder', league: 'Bundesliga', jerseyNumber: 18, teamColor: '#DD0741', teamColorSecondary: '#FFFFFF', searchName: 'Oscar Gloukh', isFeatured: true, isPopular: true },
  { id: '203', name: 'Eran Zahavi', displayName: 'Zahavi', team: 'Maccabi Tel Aviv', teamShort: 'MTA', nationality: 'Israel', position: 'Forward', league: 'Israeli Premier League', jerseyNumber: 10, teamColor: '#FFD700', teamColorSecondary: '#003580', searchName: 'Eran Zahavi', isFeatured: false, isPopular: true },
  { id: '204', name: 'Dia Saba', displayName: 'Saba', team: 'Maccabi Tel Aviv', teamShort: 'MTA', nationality: 'Israel', position: 'Midfielder', league: 'Israeli Premier League', jerseyNumber: 8, teamColor: '#FFD700', teamColorSecondary: '#003580', searchName: 'Dia Saba', isFeatured: false, isPopular: false },
  { id: '205', name: 'Maor Buzaglo', displayName: 'Buzaglo', team: 'Hapoel Beer Sheva', teamShort: 'HBS', nationality: 'Israel', position: 'Midfielder', league: 'Israeli Premier League', jerseyNumber: 7, teamColor: '#CC0000', teamColorSecondary: '#FFFFFF', searchName: 'Maor Buzaglo', isFeatured: false, isPopular: true },
  { id: '206', name: 'Ali Mohamed', displayName: 'Ali Mohamed', team: 'Maccabi Haifa', teamShort: 'MHF', nationality: 'Israel', position: 'Forward', league: 'Israeli Premier League', jerseyNumber: 10, teamColor: '#006600', teamColorSecondary: '#FFFFFF', searchName: 'Ali Mohammed', isFeatured: false, isPopular: false },
  { id: '207', name: 'Dan Glazer', displayName: 'Glazer', team: 'Beitar Jerusalem', teamShort: 'BEI', nationality: 'Israel', position: 'Midfielder', league: 'Israeli Premier League', jerseyNumber: 8, teamColor: '#FFD700', teamColorSecondary: '#000000', searchName: 'Dan Glazer', isFeatured: false, isPopular: false },
];

export const LEAGUES = [
  { id: 'all', name: 'הכל', icon: '⚽' },
  { id: 'Premier League', name: 'פרמייר ליג', icon: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { id: 'La Liga', name: 'לה ליגה', icon: '🇪🇸' },
  { id: 'Bundesliga', name: 'בונדסליגה', icon: '🇩🇪' },
  { id: 'Serie A', name: 'סריה א', icon: '🇮🇹' },
  { id: 'Ligue 1', name: "ליג 1", icon: '🇫🇷' },
  { id: 'Saudi Pro League', name: 'ליגה הסעודית', icon: '🇸🇦' },
  { id: 'Israeli Premier League', name: '🇮🇱 ליגת העל', icon: '🇮🇱' },
  { id: 'MLS', name: 'MLS', icon: '🇺🇸' },
];

export const FEATURED_PLAYERS = PLAYERS.filter((p) => p.isFeatured);
export const POPULAR_PLAYERS = PLAYERS.filter((p) => p.isPopular);

export function getPlayerById(id: string): Player | undefined {
  return PLAYERS.find((p) => p.id === id);
}

export function getPlayersByLeague(league: string): Player[] {
  if (league === 'all') return PLAYERS;
  return PLAYERS.filter((p) => p.league === league);
}
