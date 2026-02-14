# Validation Middleware - Architecture Design

## Overview

This document describes the architecture and API design for the request validation middleware that will be used in the Mini Notes API.

## Architecture

### High-Level Design

```
+-----------------+
|  HTTP Request   |
+--------+--------+
         |
         v
+-----------------------------+
|  Express.js Application     |
|                             |
|  +-----------------------+  |
|  | Validation Middleware |  |
|  |                       |  |
|  |  1. Parse Schema      |  |
|  |  2. Validate Fields   |  |
|  |  3. Transform Data    |  |
|  |  4. Handle Errors     |  |
|  +------+----------------+  |
|         |                   |
|   Valid | Invalid           |
|         v         v          |
|  +----------+ +----------+  |
|  |  Route   | |  Error   |  |
|  | Handler  | | Response |  |
|  +----------+ +----------+  |
+-----------------------------+
```

### Components

1. **Schema Definition**
   - Declarative validation rules
   - Field-level configuration
   - Reusable schemas

2. **Validation Engine**
   - Type checking
   - Length/range validation
   - Pattern matching (regex)
   - Custom validators

3. **Error Formatter**
   - Consistent error responses
   - Field-specific error messages
   - Multiple error aggregation

4. **Middleware Factory**
   - Creates configured middleware instances
   - Supports options (partial validation, custom behavior)

## API Design

### 1. Middleware Function Signature

```javascript
/**
 * Creates a validation middleware
 * @param {Object} schema - Validation schema
 * @param {Object} options - Optional configuration
 * @returns {Function} Express middleware function
 */
function validate(schema, options = {}) {
  return function(req, res, next) {
    // Validation logic
  };
}
```

### 2. Schema Definition Format

```javascript
const schema = {
  fieldName: {
    // Core validators
    required: true | false,           // Is field required?
    type: 'string' | 'number' | 'boolean' | 'array' | 'object',
    
    // String validators
    minLength: number,                // Minimum string length
    maxLength: number,                // Maximum string length
    pattern: RegExp,                  // Regex pattern
    trim: true | false,               // Trim whitespace?
    
    // Number validators
    min: number,                      // Minimum value
    max: number,                      // Maximum value
    
    // Array validators
    items: schema,                    // Item schema for arrays
    minItems: number,                 // Minimum array length
    maxItems: number,                 // Maximum array length
    
    // Custom
    custom: function(value),          // Custom validator function
    errorMessage: string,             // Custom error message
    default: any,                     // Default value if not provided
    transform: function(value)        // Transform value before validation
  }
};
```

### 3. Options Configuration

```javascript
const options = {
  partial: false,                    // Allow partial validation (for PATCH/PUT)
  strict: true,                      // Reject unknown fields
  stripUnknown: false,               // Remove unknown fields instead of rejecting
  abortEarly: false,                 // Return all errors vs first error
  source: 'body'                     // Validate req.body, req.query, or req.params
};
```

### 4. Usage Examples

#### Basic Validation

```javascript
const noteSchema = {
  title: {
    required: true,
    type: 'string',
    minLength: 1,
    maxLength: 200,
    trim: true,
    errorMessage: 'Title must be between 1-200 characters'
  },
  content: {
    required: true,
    type: 'string',
    maxLength: 10000,
    errorMessage: 'Content must not exceed 10000 characters'
  }
};

app.post('/api/notes', validate(noteSchema), (req, res) => {
  // req.body is validated and sanitized
  // title is trimmed
  // All validation passed
});
```

#### Partial Validation (Update)

```javascript
app.put('/api/notes/:id', validate(noteSchema, { partial: true }), (req, res) => {
  // Only provided fields are validated
  // Required fields are optional in partial mode
});
```

#### Optional Fields with Defaults

```javascript
const noteSchema = {
  title: { required: true, type: 'string' },
  content: { required: true, type: 'string' },
  isPinned: {
    required: false,
    type: 'boolean',
    default: false
  },
  color: {
    required: false,
    type: 'string',
    pattern: /^#[0-9A-Fa-f]{6}$/,
    errorMessage: 'Color must be in hex format (#RRGGBB)'
  }
};
```

#### Query Parameter Validation

```javascript
const querySchema = {
  page: {
    type: 'number',
    min: 1,
    default: 1,
    transform: (val) => parseInt(val, 10)
  },
  limit: {
    type: 'number',
    min: 1,
    max: 100,
    default: 10,
    transform: (val) => parseInt(val, 10)
  }
};

app.get('/api/notes', validate(querySchema, { source: 'query' }), (req, res) => {
  // req.query.page and req.query.limit are validated and converted to numbers
});
```

#### Custom Validator

```javascript
const noteSchema = {
  category: {
    type: 'string',
    custom: (value) => {
      const validCategories = ['personal', 'work', 'shopping'];
      if (!validCategories.includes(value)) {
        throw new Error(`Category must be one of: ${validCategories.join(', ')}`);
      }
      return true;
    }
  }
};
```

## Error Response Format

### Single Error

```javascript
{
  "success": false,
  "errors": [
    {
      "field": "title",
      "message": "Title must be between 1-200 characters",
      "value": ""
    }
  ]
}
```

### Multiple Errors

```javascript
{
  "success": false,
  "errors": [
    {
      "field": "title",
      "message": "Title is required",
      "value": undefined
    },
    {
      "field": "content",
      "message": "Content must not exceed 10000 characters",
      "value": "very long string..."
    },
    {
      "field": "color",
      "message": "Color must be in hex format (#RRGGBB)",
      "value": "red"
    }
  ]
}
```

### Unknown Field Error

```javascript
{
  "success": false,
  "errors": [
    {
      "field": "unknownField",
      "message": "Field is not allowed",
      "value": "some value"
    }
  ]
}
```

## Validation Flow

```
1. Middleware receives request
   v
2. Extract data from req.body/query/params
   v
3. For each field in schema:
   +- Check if required
   +- Check type
   +- Apply transformations
   +- Validate constraints
   +- Run custom validators
   v
4. Collect all errors
   v
5. If errors exist:
   +- Return 400 with error details
   v
6. If valid:
   +- Apply defaults
   +- Update req.body/query/params
   +- Call next()
```

## Module Structure

```
validation-middleware/
+-- index.js              # Main entry point
+-- lib/
|   +-- validate.js       # Core middleware factory
|   +-- validators.js     # Individual validator functions
|   +-- errors.js         # Error formatting utilities
|   +-- transformers.js   # Data transformation utilities
+-- schemas/
|   +-- note.js           # Predefined note schema
+-- test/
|   +-- validate.test.js  # Middleware tests
|   +-- validators.test.js # Validator tests
+-- package.json
+-- README.md
```

## Implementation Details

### Core Validator Functions

```javascript
// validators.js
const validators = {
  required: (value, field) => {
    if (value === undefined || value === null || value === '') {
      throw new Error(`${field} is required`);
    }
  },
  
  type: (value, expectedType, field) => {
    const actualType = Array.isArray(value) ? 'array' : typeof value;
    if (actualType !== expectedType) {
      throw new Error(`${field} must be of type ${expectedType}`);
    }
  },
  
  minLength: (value, min, field) => {
    if (value.length < min) {
      throw new Error(`${field} must be at least ${min} characters`);
    }
  },
  
  maxLength: (value, max, field) => {
    if (value.length > max) {
      throw new Error(`${field} must not exceed ${max} characters`);
    }
  },
  
  pattern: (value, regex, field) => {
    if (!regex.test(value)) {
      throw new Error(`${field} format is invalid`);
    }
  },
  
  min: (value, min, field) => {
    if (value < min) {
      throw new Error(`${field} must be at least ${min}`);
    }
  },
  
  max: (value, max, field) => {
    if (value > max) {
      throw new Error(`${field} must not exceed ${max}`);
    }
  }
};
```

### Middleware Factory

```javascript
// validate.js
function validate(schema, options = {}) {
  const defaults = {
    partial: false,
    strict: true,
    stripUnknown: false,
    abortEarly: false,
    source: 'body'
  };
  
  const config = { ...defaults, ...options };
  
  return function validationMiddleware(req, res, next) {
    const data = req[config.source];
    const errors = [];
    const validated = {};
    
    // Validate each field in schema
    for (const [field, rules] of Object.entries(schema)) {
      try {
        const value = data[field];
        
        // Check required (skip in partial mode if not provided)
        if (rules.required && value === undefined && !config.partial) {
          throw new Error(`${field} is required`);
        }
        
        // Skip validation if field not provided in partial mode
        if (value === undefined && config.partial) {
          continue;
        }
        
        // Apply transformations
        let processedValue = value;
        if (rules.trim && typeof value === 'string') {
          processedValue = value.trim();
        }
        if (rules.transform) {
          processedValue = rules.transform(processedValue);
        }
        
        // Run validators
        if (processedValue !== undefined) {
          if (rules.type) {
            validators.type(processedValue, rules.type, field);
          }
          // ... other validators
        }
        
        validated[field] = processedValue;
        
      } catch (error) {
        errors.push({
          field,
          message: rules.errorMessage || error.message,
          value: data[field]
        });
        
        if (config.abortEarly) break;
      }
    }
    
    // Check for unknown fields
    if (config.strict && !config.stripUnknown) {
      for (const field of Object.keys(data)) {
        if (!schema[field]) {
          errors.push({
            field,
            message: 'Field is not allowed',
            value: data[field]
          });
        }
      }
    }
    
    // Handle errors
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        errors
      });
    }
    
    // Apply defaults
    for (const [field, rules] of Object.entries(schema)) {
      if (validated[field] === undefined && rules.default !== undefined) {
        validated[field] = rules.default;
      }
    }
    
    // Update request with validated data
    req[config.source] = validated;
    next();
  };
}
```

## Testing Strategy

### Unit Tests

1. **Validator Functions**
   - Test each validator in isolation
   - Test edge cases (empty strings, null, undefined)
   - Test boundary values

2. **Middleware Factory**
   - Test middleware creation
   - Test options configuration
   - Test error handling

3. **Integration Tests**
   - Test with Express routes
   - Test error responses
   - Test data transformation

### Test Cases

```javascript
describe('Validation Middleware', () => {
  describe('String Validation', () => {
    it('should reject empty required string');
    it('should accept valid string within length limits');
    it('should trim whitespace when trim:true');
    it('should reject string exceeding maxLength');
    it('should validate pattern matching');
  });
  
  describe('Number Validation', () => {
    it('should convert string to number with transform');
    it('should validate min/max range');
    it('should reject non-numeric values');
  });
  
  describe('Partial Validation', () => {
    it('should allow missing required fields in partial mode');
    it('should validate provided fields only');
  });
  
  describe('Error Handling', () => {
    it('should return all errors when abortEarly:false');
    it('should return first error when abortEarly:true');
    it('should use custom error messages');
  });
});
```

## Performance Considerations

1. **Lazy Validation**: Only validate fields present in request
2. **Early Abort**: Option to stop at first error (faster)
3. **Regex Caching**: Compile regex patterns once
4. **Minimal Dependencies**: Pure JavaScript implementation
5. **Memory Efficiency**: No deep cloning unless necessary

## Security Considerations

1. **Input Sanitization**: Trim and transform user input
2. **Type Coercion**: Strict type checking to prevent injection
3. **Length Limits**: Prevent DoS with excessive data
4. **Unknown Fields**: Reject or strip unknown fields
5. **Error Messages**: Don't expose internal implementation details

## Future Enhancements

1. **Nested Object Validation**: Support for deep schema validation
2. **Array Item Validation**: Validate each array element
3. **Async Validators**: Support for database lookups
4. **Schema Composition**: Combine schemas for reuse
5. **TypeScript Support**: Type definitions for better DX
6. **Internationalization**: Multilingual error messages

## Summary

This design provides:
- [Done] Declarative, reusable validation schemas
- [Done] Flexible middleware with configuration options
- [Done] Consistent error response format
- [Done] Good developer experience
- [Done] Extensible architecture
- [Done] Security best practices
- [Done] Performance optimization
