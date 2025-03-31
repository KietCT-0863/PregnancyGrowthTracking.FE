import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { BookOpen, X, Tag, ArrowRight } from 'lucide-react';
import './BlogSuggestion.scss';

const BlogSuggestion = ({ isOpen, onClose, suggestions }) => {
  if (!isOpen || !suggestions) return null;

  return (
    <motion.div 
      className="blog-suggestion-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >



    </motion.div>
  );
};

BlogSuggestion.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  suggestions: PropTypes.shape({
    description: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
    blogs: PropTypes.arrayOf(
      PropTypes.shape({
        title: PropTypes.string.isRequired,
        excerpt: PropTypes.string.isRequired,
        image: PropTypes.string.isRequired,
        date: PropTypes.string.isRequired,
        readTime: PropTypes.number.isRequired
      })
    )
  })
};

export default BlogSuggestion; 