import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="mk-footer">
      <div className="mk-footer-grid">
        {/* COLUMN 1: BRAND */}
        <div>
          <h4>MK COLLECTIVES</h4>
          <p>
            Confident, rebellious streetwear with a touch of luxury. 
            For the city kid who treats fits like a craft.
          </p>
        </div>

        {/* COLUMN 2: SHOP */}
        <div>
          <h4>SHOP</h4>
          <ul>
            <li><Link to="/shop">All Products</Link></li>
            <li><Link to="/shop?category=hoodies">Hoodies</Link></li>
            <li><Link to="/shop?category=shortjeans">Short Jeans</Link></li>
            <li><Link to="/shop?category=jeans">Jeans</Link></li>
            <li><Link to="/shop?category=caps">Caps</Link></li>
            <li><Link to="/shop?category=sneakers">Sneakers</Link></li>
            <li><Link to="/shop?category=tops">Tops</Link></li>
          </ul>
        </div>

      

        {/* COLUMN 4: CONNECT */}
        <div>
          <h4>CONNECT</h4>
          <ul>
            <li>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                Instagram
              </a>
            </li>
            <li>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                Twitter
              </a>
            </li>
            <li>
              <a 
                href="https://tiktok.com" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                TikTok
              </a>
            </li>
            <li>
                      </li>
          </ul>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="mk-footer-bottom">
        <p>© 2026 MK COLLECTIVES. ALL RIGHTS RESERVED.</p>
        <div className="mk-footer-links">
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;