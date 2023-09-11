let originalDeck = [
    {
        image: "url('assets/images/SVG-cards-1.3/ace_of_clubs.svg')",    
        number: 11, 
        type : "ace"         
    },
    {
        image: "url('assets/images/SVG-cards-1.3/2_of_clubs.svg')",
        number: 2, 
        type : "number"       
    },
    {
        image: "url('assets/images/SVG-cards-1.3/3_of_clubs.svg')",
        number: 3, 
        type : "number"         
    },
    {
        image: "url('assets/images/SVG-cards-1.3/4_of_clubs.svg')",
        number: 4,    
        type : "number"      
    },
    {
        image: "url('assets/images/SVG-cards-1.3/5_of_clubs.svg')",
        number: 5,  
        type : "number"        
    },
    {
        image: "url('assets/images/SVG-cards-1.3/6_of_clubs.svg')",
        number: 6,    
        type : "number"      
    },
    {
        image: "url('assets/images/SVG-cards-1.3/7_of_clubs.svg')",
        number: 7,  
        type : "number"        
    },
    {
        image: "url('assets/images/SVG-cards-1.3/8_of_clubs.svg')",
        number: 8,   
        type : "number"       
    },
    {
        image: "url('assets/images/SVG-cards-1.3/9_of_clubs.svg')",
        number: 9,  
        type : "number"        
    },
    {
        image: "url('assets/images/SVG-cards-1.3/10_of_clubs.svg')",
        number: 10,  
        type : "number"        
    },
    {
        image: "url('assets/images/SVG-cards-1.3/jack_of_clubs2.svg')",
        number: 10,   
        type : "jack"     
    },
    {
        image: "url('assets/images/SVG-cards-1.3/king_of_clubs2.svg')",
        number: 10,  
        type : "king"      
    },
    {
        image: "url('assets/images/SVG-cards-1.3/queen_of_clubs2.svg')",
        number: 10,  
        type : "queen"      
    },
    {
        image: "url('assets/images/SVG-cards-1.3/ace_of_diamonds.svg')",
        number: 11,
        type : "ace"                
    },
    {
        image: "url('assets/images/SVG-cards-1.3/2_of_diamonds.svg')",
        number: 2,  
        type : "number"      
    },
    {
        image: "url('assets/images/SVG-cards-1.3/3_of_diamonds.svg')",
        number: 3, 
        type : "number"         
    },
    {
        image: "url('assets/images/SVG-cards-1.3/4_of_diamonds.svg')",
        number: 4,   
        type : "number"       
    },
    {
        image: "url('assets/images/SVG-cards-1.3/5_of_diamonds.svg')",
        number: 5,    
        type : "number"      
    },
    {
        image: "url('assets/images/SVG-cards-1.3/6_of_diamonds.svg')",
        number: 6,  
        type : "number"        
    },
    {
        image: "url('assets/images/SVG-cards-1.3/7_of_diamonds.svg')",
        number: 7, 
        type : "number"         
    },
    {
        image: "url('assets/images/SVG-cards-1.3/8_of_diamonds.svg')",
        number: 8,  
        type : "number"        
    },
    {
        image: "url('assets/images/SVG-cards-1.3/9_of_diamonds.svg')",
        number: 9,  
        type : "number"        
    },
    {
        image: "url('assets/images/SVG-cards-1.3/10_of_diamonds.svg')",
        number: 10,
        type : "number"          
    },
    {
        image: "url('assets/images/SVG-cards-1.3/jack_of_diamonds2.svg')",
        number: 10,   
        type : "jack"     
    },
    {
        image: "url('assets/images/SVG-cards-1.3/king_of_diamonds2.svg')",
        number: 10,
        type : "king"        
    },
    {
        image: "url('assets/images/SVG-cards-1.3/queen_of_diamonds2.svg')",
        number: 10,  
        type : "queen"      
    },
    {
        image: "url('assets/images/SVG-cards-1.3/ace_of_hearts.svg')",
        number: 11,   
        type : "ace"           
    },
    {
        image: "url('assets/images/SVG-cards-1.3/2_of_hearts.svg')",
        number: 2,   
        type : "number"    
    },
    {
        image: "url('assets/images/SVG-cards-1.3/3_of_hearts.svg')",
        number: 3,    
        type : "number"   
    },
    {
        image: "url('assets/images/SVG-cards-1.3/4_of_hearts.svg')",
        number: 4,    
        type : "number"   
    },
    {
        image: "url('assets/images/SVG-cards-1.3/5_of_hearts.svg')",
        number: 5,    
        type : "number"   
    },
    {
        image: "url('assets/images/SVG-cards-1.3/6_of_hearts.svg')",
        number: 6, 
        type : "number"      
    },
    {
        image: "url('assets/images/SVG-cards-1.3/7_of_hearts.svg')",
        number: 7,     
        type : "number"  
    },
    {
        image: "url('assets/images/SVG-cards-1.3/8_of_hearts.svg')",
        number: 8,    
        type : "number"   
    },
    {
        image: "url('assets/images/SVG-cards-1.3/9_of_hearts.svg')",
        number: 9,  
        type : "number"     
    },
    {
        image: "url('assets/images/SVG-cards-1.3/10_of_hearts.svg')",
        number: 10,
        type : "number"      
    },
    {
        image: "url('assets/images/SVG-cards-1.3/jack_of_hearts2.svg')",
        number: 10,  
        type : "jack"  
    },
    {
        image: "url('assets/images/SVG-cards-1.3/king_of_hearts2.svg')",
        number: 10,    
        type : "king"
    },
    {
        image: "url('assets/images/SVG-cards-1.3/queen_of_hearts2.svg')",
        number: 10,    
        type : "queen"    
    },
    {
        image: "url('assets/images/SVG-cards-1.3/ace_of_spades.svg')",
        number: 11,   
        type : "ace"  
    },
    {
        image: "url('assets/images/SVG-cards-1.3/2_of_spades.svg')",
        number: 2,  
        type : "number"   
    },
    {
        image: "url('assets/images/SVG-cards-1.3/3_of_spades.svg')",
        number: 3,  
        type : "number"    
    },
    {
        image: "url('assets/images/SVG-cards-1.3/4_of_spades.svg')",
        number: 4,   
        type : "number"   
    },
    {
        image: "url('assets/images/SVG-cards-1.3/5_of_spades.svg')",
        number: 5,   
        type : "number"   
    },
    {
        image: "url('assets/images/SVG-cards-1.3/6_of_spades.svg')",
        number: 6,   
        type : "number"   
    },
    {
        image: "url('assets/images/SVG-cards-1.3/7_of_spades.svg')",
        number: 7,  
        type : "number"    
    },
    {
        image: "url('assets/images/SVG-cards-1.3/8_of_spades.svg')",
        number: 8, 
        type : "number"     
    },
    {
        image: "url('assets/images/SVG-cards-1.3/9_of_spades.svg')",
        number: 9,   
        type : "number"   
    },
    {
        image: "url('assets/images/SVG-cards-1.3/10_of_spades.svg')",
        number: 10,  
        type : "number"   
    },
    {
        image: "url('assets/images/SVG-cards-1.3/jack_of_spades2.svg')",
        number: 10,    
        type : "jack"
    },
    {
        image: "url('assets/images/SVG-cards-1.3/king_of_spades2.svg')",
        number: 10,    
        type : "king"
    },
    {
        image: "url('assets/images/SVG-cards-1.3/queen_of_spades2.svg')",
        number: 10,    
        type : "queen"
    },
    
];