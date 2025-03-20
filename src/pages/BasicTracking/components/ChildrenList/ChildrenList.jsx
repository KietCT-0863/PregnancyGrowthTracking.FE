import { motion } from "framer-motion";
import "./ChildrenList.scss";

const ChildrenList = ({ children, selectedChild, onChildSelect }) => {
  return (
    <motion.div
      className="children-list"
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      {children.map((child, index) => (
        <motion.div
          key={child.foetusId}
          className={`child-name-tag ${selectedChild?.foetusId === child.foetusId ? "active" : ""}`}
          onClick={() => onChildSelect(child)}
          whileHover={{ scale: 1.05, y: -5 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 + 0.3 }}
        >
          {child.name}
          {selectedChild?.foetusId === child.foetusId && (
            <motion.div
              className="active-indicator"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              layoutId="activeIndicator"
            />
          )}
        </motion.div>
      ))}
    </motion.div>
  );
};

export default ChildrenList; 