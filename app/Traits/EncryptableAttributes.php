<?php

namespace App\Traits;

use Illuminate\Support\Facades\Crypt;

trait EncryptableAttributes
{

    /**
     * Get an attribute from the model.
     *
     * @param  string  $key
     * @return mixed
     */
    public function getAttribute($key)
    {
        $value = parent::getAttribute($key);

        if (property_exists($this, 'encryptable') && in_array($key, $this->encryptable) && !is_null($value)) {
            try {
                return Crypt::decryptString($value);
            } catch (\Exception $e) {
                // If decryption fails, return the original value
                // This handles cases where data might not be encrypted yet
                return $value;
            }
        }

        return $value;
    }

    /**
     * Set a given attribute on the model.
     *
     * @param  string  $key
     * @param  mixed  $value
     * @return mixed
     */
    public function setAttribute($key, $value)
    {
        if (property_exists($this, 'encryptable') && in_array($key, $this->encryptable) && !is_null($value)) {
            try {
                $value = Crypt::encryptString($value);
            } catch (\Exception $e) {
                // If encryption fails, log the error but continue
                \Log::error('Failed to encrypt attribute', [
                    'model' => get_class($this),
                    'attribute' => $key,
                    'error' => $e->getMessage()
                ]);
            }
        }

        return parent::setAttribute($key, $value);
    }

    /**
     * Get the encryptable attributes for the model.
     *
     * @return array
     */
    public function getEncryptableAttributes()
    {
        return property_exists($this, 'encryptable') ? $this->encryptable : [];
    }

    /**
     * Set the encryptable attributes for the model.
     *
     * @param  array  $encryptable
     * @return $this
     */
    public function setEncryptableAttributes(array $encryptable)
    {
        $this->encryptable = $encryptable;
        return $this;
    }

    /**
     * Convert the model instance to an array.
     * Ensures encrypted attributes are properly decrypted.
     *
     * @return array
     */
    public function toArray()
    {
        $array = parent::toArray();

        // Ensure encrypted attributes are decrypted in the array representation
        if (property_exists($this, 'encryptable')) {
            foreach ($this->encryptable as $key) {
                if (array_key_exists($key, $array) && !is_null($array[$key])) {
                    // Access the attribute through the accessor to ensure decryption
                    $array[$key] = $this->getAttribute($key);
                }
            }
        }

        return $array;
    }
}
